var Pincho = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite("spike.png");
        var body = new cp.StaticBody();
        body.setPos(posicion);
        body.setAngle(0);
        this.sprite.setBody(body);
        this.shape = new cp.BoxShape(body, this.sprite.getContentSize().width, this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoPincho);
        this.shape.setSensor(true);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

        var framesAnimacion = [];
        var str = "spike.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        framesAnimacion.push(frame);
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle = new cc.RepeatForever(new cc.Animate(animacion));
        this.sprite.runAction(actionAnimacionBucle);
    }
});



