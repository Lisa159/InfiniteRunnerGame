var DisparoJugador = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite("#disparo1.png");
        this.body = new cp.Body(5,Infinity);
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio , cp.vzero);
        this.shape.setCollisionType(tipoDisparoJugador);
        gameLayer.space.addShape(this.shape);
        gameLayer.addChild(this.sprite,10);
        this.body.applyImpulse(cp.v(400, 0), cp.v(0, 0));

        var framesAnimacion = [];
        for (var i = 1; i <= 3; i++) {
            var str = "disparo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle = new cc.RepeatForever(new cc.Animate(animacion));
        this.sprite.runAction(actionAnimacionBucle);
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    },
    actualizar: function(){
        this.body.applyImpulse(cp.v(100, 0), cp.v(0, 0));
    }
});