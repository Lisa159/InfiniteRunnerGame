
var Enemigo = cc.Class.extend({
    orientacion:1,
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite("#cuervo1.png");
        this.body = new cp.Body(5,Infinity);
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        this.shape = new cp.BoxShape(this.body, this.sprite.getContentSize().width, this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addShape(this.shape);

        var mitadAncho = this.sprite.getContentSize().width/2;
        var mitadAlto = this.sprite.getContentSize().height/2;

        this.shapeIzquierda = new cp.PolyShape(this.body, [ -mitadAncho, 0, -mitadAncho, -mitadAlto - 10] , cp.v(0,0) );
        this.shapeIzquierda.setSensor(true);
        this.shapeIzquierda.setCollisionType(tipoEnemigoIzquierda);
        gameLayer.space.addShape(this.shapeIzquierda);

        this.shapeDercha = new cp.PolyShape(this.body, [ mitadAncho, 0, mitadAncho, -mitadAlto - 10] , cp.v(0,0) );
        this.shapeDercha.setSensor(true);
        this.shapeDercha.setCollisionType(tipoEnemigoDerecha);
        gameLayer.space.addShape(this.shapeDercha);
        gameLayer.addChild(this.sprite,10);

        var framesAnimacion = [];
        for (var i = 1; i <= 8; i++) {
            var str = "cuervo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle = new cc.RepeatForever(new cc.Animate(animacion));
        this.sprite.runAction(actionAnimacionBucle);

        gameLayer.space.addCollisionHandler(tipoSuelo, tipoEnemigoIzquierda,
            null, null, null, this.noSueloIzquierda.bind(this));
        gameLayer.space.addCollisionHandler(tipoSuelo, tipoEnemigoDerecha,
            null, null, null, this.noSueloDerecha.bind(this));

    },
    actualizar: function(){
        if ( this.body.vx < 0.005 && this.body.vx > -0.005){
            this.orientacion = this.orientacion *-1;
        }
        if ( this.orientacion > 0){
            this.sprite.flippedX = true; // Invertir Sprite
            if (this.body.vx < 100){
                this.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
            }
            else { // vx mayor más de 100
                this.body.vx = 100;
            }
        }
        if ( this.orientacion < 0) {
            this.sprite.flippedX = false; // No invertir Sprite
            if (this.body.vx > -100){
                this.body.applyImpulse(cp.v(-300, 0), cp.v(0, 0));
            }
            else { // vx nunca menor que -100
                this.body.vx = -100; //limitado
            }
        }
    },
    noSueloDerecha : function(){
        this.orientacion = -1;
    },
    noSueloIzquierda: function(){
        this.orientacion = 1;
    },
    eliminar: function(){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }

});
