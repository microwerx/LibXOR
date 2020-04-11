///<reference path="htmlutils.ts"/>

class ComponentInfo {
    constructor(readonly id: number, public name: string, public desc: string) { }
}

class EntityInfo {
    components = new Set<number>()
    constructor(readonly id: number, public name: string, public desc: string) { }
}

class ECS {
    entities = new Map<number, EntityInfo>()
    newEntityIndex = 0

    components = new Map<number, ComponentInfo>()
    newComponentIndex = 0

    assemblages = new Map<number, Set<number>>()
    newAssemblageIndex = 0

    componentEntityData = new Map<number, Map<number, any>>()

    constructor() {
    }

    addEntity(name: string, desc: string): number {
        let id = this.newEntityIndex++
        this.entities.set(id, new EntityInfo(id, name, desc))
        return id
    }

    addComponent(name: string, desc: string) {
        let id = this.newComponentIndex++
        this.components.set(id, new ComponentInfo(id, name, desc))
    }

    test() {
        let ii = this.getEntitiesWithComponent(1).next()
    }

    getEntitiesWithComponent(componentID: number): IterableIterator<number> {
        if (!this.componentEntityData.has(componentID)) return null
        return this.componentEntityData.get(componentID).keys()
    }

    addEntityComponent(entityID: number, componentID: number): boolean {
        if (!this.entities.has(entityID))
            return false
        this.entities.get(entityID).components.add(componentID)
        this.setComponentData(entityID, componentID, null)
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

        let entityData = this.componentEntityData.get(componentID)
        entityData.set(entityID, componentData)
        return true
    }

    getComponentData(entityID: number, componentID: number): any {
        if (!this.entities.has(entityID)) return null
        if (!this.entities.get(entityID).components.has(componentID)) return null
        return this.componentEntityData.get(componentID).get(entityID)
    }

    addAssemblage(): number {
        let id = this.newAssemblageIndex++
        this.assemblages.set(id, new Set<number>())
        return id
    }

    deleteAssemblage(assemblageID: number) {
        this.assemblages.delete(assemblageID)
    }

    addComponentToAssemblage(assemblageID: number, componentID: number): boolean {
        if (!this.assemblages.has(assemblageID)) return false
        this.assemblages.get(assemblageID).add(componentID)
        return true
    }
}