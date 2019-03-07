
var ControlesLayer = cc.Layer.extend({
    spriteBotonSaltar:null,
    spriteBotonDisparar:null,
    etiquetaMonedas:null,
    monedas:0,
    etiquetaVidas:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Contador Monedas
        this.etiquetaMonedas = new cc.LabelTTF("Monedas: 0", "Helvetica", 20);
        this.etiquetaMonedas.setPosition(cc.p(size.width - 90, size.height - 20));
        this.etiquetaMonedas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaMonedas);

        // Contador Vidas
        this.etiquetaVidas = new cc.LabelTTF("Vidas: 3", "Helvetica", 20);
        this.etiquetaVidas.setPosition(cc.p(size.width - 725, size.height - 20));
        this.etiquetaVidas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaVidas);

        // BotonSaltar
        this.spriteBotonSaltar = cc.Sprite.create(res.boton_saltar_png);
        this.spriteBotonSaltar.setPosition(cc.p(size.width*0.8, size.height*0.5));
        this.addChild(this.spriteBotonSaltar);

        // BotonDisparar
        this.spriteBotonDisparar = cc.Sprite.create(res.boton_disparar);
        this.spriteBotonDisparar.setPosition(cc.p(size.width*0.8, size.height*0.3));
        this.addChild(this.spriteBotonDisparar);

        // Registrar Mouse Down
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown.bind(this)
        }, this)

        this.scheduleUpdate();
        return true;
    },
    update:function (dt) {

    },
    procesarMouseDown:function(event) {
        var areaBotonSaltar = this.spriteBotonSaltar.getBoundingBox();
        var areaBotonDisparar = this.spriteBotonDisparar.getBoundingBox();

        // La pulsación cae dentro del botón de saltar
        if (cc.rectContainsPoint(areaBotonSaltar, cc.p(event.getLocationX(), event.getLocationY()) )){
            var gameLayer = this.getParent().getChildByTag(idCapaJuego);
            // tenemos el objeto GameLayer
            gameLayer.jugador.saltar();
        }

        // La pulsación cae dentro del botón de disparar
        if (cc.rectContainsPoint(areaBotonDisparar, cc.p(event.getLocationX(), event.getLocationY()) )){
            var gameLayer = this.getParent().getChildByTag(idCapaJuego);
            // tenemos el objeto GameLayer
            gameLayer.jugador.disparar();
        }

    },
    agregarMoneda:function(){
        this.monedas++;
        this.etiquetaMonedas.setString("Monedas: " + this.monedas);
    },
    quitarVida:function(v){
        this.etiquetaVidas.setString("Vidas: " + v);
    }

});

