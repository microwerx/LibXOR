/// <reference path="../LibXOR.d.ts" />
var XOR;
(function (XOR) {
    class ComponentInfo {
        constructor(id, name, desc) {
            this.id = id;
            this.name = name;
            this.desc = desc;
        }
    }
    XOR.ComponentInfo = ComponentInfo;
    class EntityInfo {
        constructor(id, name, desc) {
            this.id = id;
            this.name = name;
            this.desc = desc;
            this.components = new Set();
        }
    }
    XOR.EntityInfo = EntityInfo;
    class ECS {
        /**
         * @constructor
         */
        constructor() {
            this.entities = new Map();
            this.newEntityIndex = 0;
            this.components = new Map();
            this.newComponentIndex = 0;
            this.assemblages = new Map();
            this.assemblagesEntities = new Map();
            this.newAssemblageIndex = 0;
            this.componentEntityData = new Map();
        }
        /**
         *
         * @param name name of the entity
         * @param desc a helpful debugging description
         */
        addEntity(name, desc) {
            let id = this.newEntityIndex++;
            this.entities.set(id, new EntityInfo(id, name, desc));
            return id;
        }
        /**
         *
         * @param entityID the index of the entity
         * @param assemblageID the assembly to use to create the components
         * @returns number of components added to entity
         */
        addAssemblageToEntity(entityID, assemblageID) {
            if (!this.assemblages.has(assemblageID))
                return 0;
            let assemblage = this.assemblages.get(assemblageID);
            let addedCount = 0;
            for (let componentID of assemblage) {
                this.addEntityComponent(entityID, componentID);
                addedCount++;
            }
            this.assemblagesEntities.get(assemblageID).add(entityID);
            return addedCount;
        }
        /**
         *
         * @param assemblageID the index of the assembly
         * @returns {Iterable<Number} an iterable of entityIDs
         */
        getEntitiesWithAssemblage(assemblageID) {
            if (!this.assemblages.has(assemblageID))
                return new Set().keys();
            return this.assemblagesEntities.get(assemblageID).keys();
        }
        /**
         *
         * @param name the name of the component
         * @param desc a helpful debugging description
         */
        addComponent(name, desc) {
            let id = ++this.newComponentIndex;
            this.components.set(id, new ComponentInfo(id, name, desc));
            return id;
        }
        getEntitiesWithComponent(componentID) {
            if (!this.componentEntityData.has(componentID))
                return null;
            return this.componentEntityData.get(componentID).keys();
        }
        getEntitiesWithComponents(componentIDs) {
            let C = [];
            for (let cID of componentIDs) {
                if (!this.componentEntityData.has(cID))
                    return null;
                C.push(this.componentEntityData.get(cID));
            }
            let srckeys = this.componentEntityData.get(componentIDs[0]).keys();
            let entities = new Set();
            for (let k of srckeys) {
                let i = 0;
                for (; i < C.length; i++) {
                    if (!C[i].has(k)) {
                        break;
                    }
                }
                if (i != componentIDs.length)
                    continue;
                entities.add(k);
            }
            return entities.keys();
        }
        addEntityComponent(entityID, componentID) {
            if (!this.entities.has(entityID))
                return false;
            this.entities.get(entityID).components.add(componentID);
            return this.setComponentData(entityID, componentID, null);
        }
        deleteEntityComponent(entityID, componentID) {
            if (!this.entities.has(entityID))
                return false;
            if (!this.entities.get(entityID).components.has(componentID))
                return false;
            this.componentEntityData.get(componentID).delete(entityID);
            this.entities.get(entityID).components.delete(componentID);
            return true;
        }
        setComponentData(entityID, componentID, componentData) {
            if (!this.entities.has(entityID))
                return false;
            if (!this.entities.get(entityID).components.has(componentID))
                return false;
            if (!this.componentEntityData.has(componentID)) {
                this.componentEntityData.set(componentID, new Map());
            }
            let entityData = this.componentEntityData.get(componentID);
            if (!entityData) {
                return false;
            }
            entityData.set(entityID, componentData);
            return true;
        }
        getComponentData(entityID, componentID) {
            if (!this.entities.has(entityID))
                return null;
            if (!this.entities.get(entityID).components.has(componentID))
                return null;
            return this.componentEntityData.get(componentID).get(entityID);
        }
        addAssemblage() {
            let id = ++this.newAssemblageIndex;
            this.assemblages.set(id, new Set());
            this.assemblagesEntities.set(id, new Set());
            return id;
        }
        deleteAssemblage(assemblageID) {
            if (!this.assemblages.has(assemblageID))
                return false;
            this.assemblages.delete(assemblageID);
            return true;
        }
        addComponentToAssemblage(assemblageID, componentID) {
            if (!this.assemblages.has(assemblageID))
                return false;
            this.assemblages.get(assemblageID).add(componentID);
            return true;
        }
    }
    XOR.ECS = ECS;
})(XOR || (XOR = {}));
