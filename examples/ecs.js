///<reference path="htmlutils.ts"/>
var ECS = /** @class */ (function () {
    function ECS() {
        this.entities = [];
        this.newEntityIndex = 0;
        this.componentEntityData = new Map();
    }
    ECS.prototype.addEntity = function () {
        var id = this.newEntityIndex++;
        this.entities.push(id);
        return id;
    };
    ECS.prototype.newComponent = function (entityID, componentID, componentData) {
        var entityData = this.componentEntityData.get(componentID);
        if (!entityData)
            return false;
    };
    ECS.prototype.getEntity = function (entityID) {
        entityID = entityID || 0;
    };
    ECS.prototype.addComponentToEntity = function () {
    };
    return ECS;
}());
