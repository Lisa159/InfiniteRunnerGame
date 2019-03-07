var estadoCaminando = 1;
var estadoSaltando = 2;
var estadoImpactado = 3;
var estadoDisparando = 4;
var estadoSinDisparar = 0;

var Jugador = cc.Class.extend({
    estado: estadoCaminando,
    disparo: estadoSinDisparar,
    animacion:null,
    aSaltar:null,
    aCaminar:null,
    gameLayer:null,
    sprite:null,
    shape:null,
    body:null,
    vidas:null,
    tiempoInvulnerable:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.vidas = 3;
        this.tiempoInvulnerable = 0;
        this.sprite = new cc.PhysicsSprite("#jugador_caminar1.png");
        this.body = new cp.Body(5, cp.momentForBox(1, this.sprite.getContentSize().width, this.sprite.getContentSize().height));
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);

        var ancho = this.sprite.getContentSize().width - 16;
        var alto = this.sprite.getContentSize().height - 16;

        this.shape = new cp.BoxShape(this.body, ancho, alto);
        this.shape.setCollisionType(tipoJugador);
        gameLayer.space.addShape(this.shape);

        gameLayer.addChild(this.sprite,10);

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 4; i++) {
            var str = "jugador_caminar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));
        this.aCaminar = actionAnimacionBucle;
        this.aCaminar.retain();
        this.sprite.runAction(actionAnimacionBucle);

        this.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));

        var framesAnimacionSaltar = [];
        for (var i = 1; i <= 4; i++) {
            var str = "jugador_saltar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionSaltar.push(frame);
        }
        var animacionSaltar = new cc.Animation(framesAnimacionSaltar, 0.2);
        this.aSaltar  = new cc.RepeatForever(new cc.Animate(animacionSaltar));

        this.aSaltar.retain();
        var framesAnimacionImpactado = [];
        for (var i = 1; i <= 4; i++) {
            var str = "jugador_impactado" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionImpactado.push(frame);
        }
        var animacionImpactado = new cc.Animation(framesAnimacionImpactado, 0.2);
        this.aImpactado = new cc.Repeat( new cc.Animate(animacionImpactado) , 2  );
        this.aImpactado.retain();


    },
    saltar: function(){
        // solo salta si está caminando
        if(this.estado == estadoCaminando){
            this.estado = estadoSaltando;
            this.body.applyImpulse(cp.v(0, 1800), cp.v(0, 0));
        }
    },
    disparar: function(){
        this.disparo = estadoDisparando;
    },
    stopDisparar: function(){
        this.disparo = estadoSinDisparar;
    },
    actualizar: function (){
        if (this.tiempoInvulnerable > 0 ){
            this.tiempoInvulnerable--;
        }
        switch ( this.estado ){
            case estadoImpactado:
                if (this.animacion != this.aImpactado){
                    this.animacion = this.aImpactado;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(
                        cc.sequence(
                            this.animacion,
                            cc.callFunc(this.finAnimacionImpactado(), this) )
                    );
                }
            case estadoSaltando:
                if (this.animacion != this.aSaltar){
                    this.animacion = this.aSaltar;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                break;
            case estadoCaminando:
                if (this.animacion != this.aCaminar){
                    this.animacion = this.aCaminar;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                break;
        }
    },
    tocaSuelo: function(){
        if(this.estado != estadoCaminando){
            this.estado = estadoCaminando;
        }
    },
    impactado: function(){
        if (this.tiempoInvulnerable <= 0) {
            if (this.vidas > 0) {
                this.vidas--;
                this.tiempoInvulnerable = 100;
                // 100 actualizaciones de loop
                this.estado = estadoImpactado;
            }
        }
    },
    finAnimacionImpactado: function(){
        if(this.estado == estadoImpactado){
            this.estado = estadoCaminando;
        }
    }

});


