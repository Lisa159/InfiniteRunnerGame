var idCapaJuego = 1;
var idCapaControles = 2;
var tipoSuelo = 1;
var tipoJugador = 2;
var tipoMoneda = 3;
var tipoEnemigo = 4;
var tipoEnemigoDerecha = 5;
var tipoEnemigoIzquierda = 6;
var tipoPincho = 7;
var tipoDisparoJugador = 8;

var GameLayer = cc.Layer.extend({
    _emitter: null,
    tiempoEfecto:0,
    monedas:[],
    enemigos:[],
    pinchos:[],
    formasEliminar:[],
    formasEliminarDisparos:[],
    disparos:[],
    jugador: null,
    space:null,
    mapa: null,
    mapaAncho: null,
    mapaAlto: null,
    YScroll: null,

    ctor:function () {
        this._super();
        var size = cc.winSize;
        this.YScroll = 225;

        cc.spriteFrameCache.addSpriteFrames(res.moneda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_caminar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_saltar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_impactado_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacion_cuervo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.pincho_split);
        cc.spriteFrameCache.addSpriteFrames(res.disparo_plist);

        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);
        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        this.jugador = new Jugador(this, cc.p(50,150));

        this.cargarMapa();
        this.scheduleUpdate();

        this.space.addCollisionHandler(tipoSuelo, tipoJugador,
            null, null, this.collisionSueloConJugador.bind(this), this.finCollisionSueloConJugador.bind(this));

        this.space.addCollisionHandler(tipoJugador, tipoMoneda,
            null, this.collisionJugadorConMoneda.bind(this), null, null);

        this.space.addCollisionHandler(tipoEnemigo, tipoJugador,
            null, null, this.collisionEnemigoConJugador.bind(this), null);

        this.space.addCollisionHandler(tipoJugador, tipoPincho,
            null, this.collisionJugadorConPincho.bind(this), null, null);

        this.space.addCollisionHandler(tipoDisparoJugador, tipoEnemigo,
            null, this.collisionDisparoConEnemigo.bind(this), null, null);

        this._emitter =  new cc.ParticleGalaxy.create();
        this._emitter.setEmissionRate(0);
        this._emitter.shapeType = cc.ParticleSystem.STAR_SHAPE;
        this.addChild(this._emitter,10);

        return true;
    },
    update:function (dt) {
        if (this.tiempoEfecto > 0){
            this.tiempoEfecto = this.tiempoEfecto - dt;
            this._emitter.x =  this.jugador.body.p.x;
            this._emitter.y =  this.jugador.body.p.y;
        }
        if (this.tiempoEfecto < 0) {
            this._emitter.setEmissionRate(0);
            this.tiempoEfecto = 0;
        }
        this.jugador.actualizar();
        for(i=0; i < this.enemigos.length; i++){
            this.enemigos[i].actualizar();
        }
        var posX1 = this.jugador.body.p.x - this.getContentSize().width/4;
        var posX2 = posX1 + this.getContentSize().width;
        for(i=0; i < this.disparos.length; i++){
            this.disparos[i].actualizar();
            if(this.disparos[i].body.p.x > posX2 || this.disparos[i].body.p.x < posX1){
                this.disparos[i].eliminar();
                this.disparos.splice(i, 1);
            }
        }
        this.space.step(dt);

        //Scroll
        var scrollX = this.getContentSize().width/4;
        var scrollY = this.getContentSize().height/2;
        var posicionXJugador = this.jugador.body.p.x - scrollX;
        var posicionYJugador = this.jugador.body.p.y - scrollY;
        if(posicionYJugador < 0){
            this.setPosition(cc.p( -posicionXJugador, 0));
        }
        else if(posicionYJugador > this.mapaAlto - (scrollY*2)){
            this.setPosition(cc.p(-posicionXJugador, -(this.mapaAlto - (scrollY*2))));
        }
        else{
            this.setPosition(cc.p(-posicionXJugador, -posicionYJugador));
        }

        // Caída, sí cae vuelve a la posición inicial
        if( this.jugador.body.p.y < -100){
            this.jugador.body.p = cc.p(50,150);
        }

        //Crear disparos
        if(this.jugador.disparo == estadoDisparando){
            var d = new DisparoJugador(this,cc.p(this.jugador.body.p.x,this.jugador.body.p.y)); //le paso la posicion del jugador
            this.disparos.push(d);
            this.jugador.stopDisparar();
        }
        for(var i = 0; i < this.formasEliminar.length; i++) {
            var shape = this.formasEliminar[i];
            for (var i = 0; i < this.monedas.length; i++) {
                if (this.monedas[i].shape == shape) {
                    this.monedas[i].eliminar();
                    this.monedas.splice(i, 1);
                }
            }
            for (var i = 0; i < this.disparos.length; i++) {
                //console.log("this.disparos.length: " +this.disparos.length);
                if (this.disparos[i].shape == shape) {
                    //console.log("elimina disparo");
                    this.disparos[i].eliminar();
                    this.disparos.splice(i, 1);
                }
            }
            for (var i = 0; i < this.enemigos.length; i++) {
                if (this.enemigos[i].shape == shape) {
                    console.log("elimino enemigo");
                    this.enemigos[i].eliminar();
                    this.enemigos.splice(i, 1);
                }
            }
        }
        this.formasEliminar = [];

        //Jugador
        if ( this.jugador.body.a > 0.44 ){
            this.jugador.body.a = 0.44;
        }
        if ( this.jugador.body.a < -0.44){
            this.jugador.body.a = -0.44;
        }
        if (this.jugador.body.vx < 250){
            this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
        }
        if (this.jugador.body.vx > 400){
            this.jugador.body.vx = 400;
        }
        if (this.jugador.body.vy > 450){
            this.jugador.body.vy = 450;
        }
    },
    cargarMapa:function () {
        this.mapa = new cc.TMXTiledMap(res.mapa1_tmx);
        this.addChild(this.mapa);
        this.mapaAncho = this.mapa.getContentSize().width;
        this.mapaAlto = this.mapa.getContentSize().height;
        var grupoSuelos = this.mapa.getObjectGroup("Suelos");
        var suelosArray = grupoSuelos.getObjects();
        for (var i = 0; i < suelosArray.length; i++) {
            var suelo = suelosArray[i];
            var puntos = suelo.polylinePoints;
            for(var j = 0; j < puntos.length - 1; j++){
                var bodySuelo = new cp.StaticBody();
                var shapeSuelo = new cp.SegmentShape(bodySuelo,
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j].x),
                        parseInt(suelo.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j + 1].x),
                        parseInt(suelo.y) - parseInt(puntos[j + 1].y)),
                    10);
                shapeSuelo.setCollisionType(tipoSuelo);
                this.space.addStaticShape(shapeSuelo);
            }
        }

        // Cargamos monedas
        var grupoMonedas = this.mapa.getObjectGroup("Monedas");
        var monedasArray = grupoMonedas.getObjects();
        for (var i = 0; i < monedasArray.length; i++) {
            var moneda = new Moneda(this, cc.p(monedasArray[i]["x"],monedasArray[i]["y"]));
            this.monedas.push(moneda);
        }

        // Cargamos enemigos
        var grupoEnemigos = this.mapa.getObjectGroup("Enemigos");
        var enemigosArray = grupoEnemigos.getObjects();
        for (var i = 0; i < enemigosArray.length; i++) {
            var enemigo = new Enemigo(this, cc.p(enemigosArray[i]["x"],enemigosArray[i]["y"]));
            this.enemigos.push(enemigo);
        }

        // Cargamos pinchos
        var grupoPinchos = this.mapa.getObjectGroup("Pinchos");
        var pinchosArray = grupoPinchos.getObjects();
        for (var i = 0; i < pinchosArray.length; i++) {
            var pincho = new Pincho(this, cc.p(pinchosArray[i]["x"],pinchosArray[i]["y"]));
            this.pinchos.push(pincho);
        }

    },
    collisionSueloConJugador:function (arbiter, space) {
        this.jugador.tocaSuelo();
    },
    finCollisionSueloConJugador:function (arbiter, space) {
        this.jugador.estado = estadoSaltando;
    },
    collisionJugadorConMoneda:function (arbiter, space) {
        this._emitter.setEmissionRate(5);
        this.tiempoEfecto = 3;
        this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
        var shapes = arbiter.getShapes();
        this.formasEliminar.push(shapes[1]);
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarMoneda();
    },
    finCollisionSueloConJugador:function (arbiter, space) {
        this.jugador.estado = estadoSaltando;
    },
    collisionEnemigoConJugador:function(arbiter, space){
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        if(this.jugador.vidas == 0){
            this.jugador.body.p = cc.p(50,150);
            this.jugador.vidas = 3;
            capaControles.etiquetaVidas.setString("Vidas: " + 3);
        }
        else{
            this.jugador.impactado();
            capaControles.quitarVida(this.jugador.vidas);
        }
    },
    collisionJugadorConPincho:function (arbiter, space) {
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        this.jugador.body.p = cc.p(50,150);
        this.jugador.vidas = 3;
        capaControles.etiquetaVidas.setString("Vidas: " + 3);
    },
    collisionDisparoConEnemigo:function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.formasEliminar.push(shapes[1]);
        this.formasEliminar.push(shapes[2]);
    },
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        //El 0 es el orden en el que se meten (va una detras de otra en este caso)
        this.addChild(layer, 0, idCapaJuego);
        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);
    }
});
