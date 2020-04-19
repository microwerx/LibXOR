/// <reference path="../LibXOR.d.ts" />

namespace XOR {
    export class ComponentInfo {
        constructor(readonly id: number, public name: string, public desc: string) { }
    }

    export class EntityInfo {
        components = new Set<number>()
        constructor(readonly id: number, public name: string, public desc: string) { }
    }

    export class ECS {
        entities = new Map<number, EntityInfo>()
        newEntityIndex = 0

        components = new Map<number, ComponentInfo>()
        newComponentIndex = 0

        assemblages = new Map<number, Set<number>>()
        assemblagesEntities = new Map<number, Set<number>>()
        newAssemblageIndex = 0

        componentEntityData = new Map<number, Map<number, any>>()

        /**
         * @constructor
         */
        constructor() {
        }

        /**
         * 
         * @param name name of the entity
         * @param desc a helpful debugging description
         */
        addEntity(name: string, desc: string): number {
            let id = this.newEntityIndex++
            this.entities.set(id, new EntityInfo(id, name, desc))
            return id
        }

        /**
         * 
         * @param entityID the index of the entity
         * @param assemblageID the assembly to use to create the components
         * @returns number of components added to entity
         */
        addAssemblageToEntity(entityID: number, assemblageID: number): number {
            if (!this.assemblages.has(assemblageID))
                return 0
            let assemblage = this.assemblages.get(assemblageID)
            let addedCount = 0
            for (let componentID of assemblage) {
                this.addEntityComponent(entityID, componentID)
                addedCount++
            }
            this.assemblagesEntities.get(assemblageID).add(entityID)
            return addedCount
        }

        /**
         * 
         * @param assemblageID the index of the assembly
         * @returns {Iterable<Number} an iterable of entityIDs
         */
        getEntitiesWithAssemblage(assemblageID): Iterable<Number> {
            if (!this.assemblages.has(assemblageID))
                return new Set<number>().keys()
            return this.assemblagesEntities.get(assemblageID).keys()
        }

        /**
         * 
         * @param name the name of the component
         * @param desc a helpful debugging description
         */
        addComponent(name: string, desc: string) {
            let id = ++this.newComponentIndex
            this.components.set(id, new ComponentInfo(id, name, desc))
            return id
        }

        getEntitiesWithComponent(componentID: number): IterableIterator<number> {
            if (!this.componentEntityData.has(componentID)) return null
            return this.componentEntityData.get(componentID).keys()
        }

        getEntitiesWithComponents(componentIDs: number[]): IterableIterator<number> {
            let C: Map<number, any>[] = [];
            for (let cID of componentIDs) {
                if (!this.componentEntityData.has(cID))
                    return null
                C.push(this.componentEntityData.get(cID))
            }
            let srckeys = this.componentEntityData.get(componentIDs[0]).keys()
            let entities = new Set<number>();
            for (let k of srckeys) {
                let i = 0
                for (; i < C.length; i++) {
                    if (!C[i].has(k)) {
                        break
                    }
                }
                if (i != componentIDs.length)
                    continue
                entities.add(k)
            }
            return entities.keys()
        }

        addEntityComponent(entityID: number, componentID: number): boolean {
            if (!this.entities.has(entityID))
                return false
            this.entities.get(entityID).components.add(componentID)
            return this.setComponentData(entityID, componentID, null)
        }

        deleteEntityComponent(entityID: number, componentID: number): boolean {
            if (!this.entities.has(entityID))
                return false
            if (!this.entities.get(entityID).components.has(componentID))
                return false
            this.componentEntityData.get(componentID).delete(entityID)
            this.entities.get(entityID).components.delete(componentID)
            return true
        }

        setComponentData(entityID: number, componentID: number, componentData: any): boolean {
            if (!this.entities.has(entityID)) return false
            if (!this.entities.get(entityID).components.has(componentID)) return false

            if (!this.componentEntityData.has(componentID)) {
                this.componentEntityData.set(componentID, new Map<number, any>())
            }
            let entityData = this.componentEntityData.get(componentID)
            if (!entityData) {
                return false
            }
            entityData.set(entityID, componentData)
            return true
        }

        getComponentData(entityID: number, componentID: number): any {
            if (!this.entities.has(entityID)) return null
            if (!this.entities.get(entityID).components.has(componentID)) return null
            return this.componentEntityData.get(componentID).get(entityID)
        }

        addAssemblage(): number {
            let id = ++this.newAssemblageIndex
            this.assemblages.set(id, new Set<number>())
            this.assemblagesEntities.set(id, new Set<number>())
            return id
        }

        deleteAssemblage(assemblageID: number): boolean {
            if (!this.assemblages.has(assemblageID)) return false
            this.assemblages.delete(assemblageID)
            return true
        }

        addComponentToAssemblage(assemblageID: number, componentID: number): boolean {
            if (!this.assemblages.has(assemblageID)) return false
            this.assemblages.get(assemblageID).add(componentID)
            return true
        }
    }
}
