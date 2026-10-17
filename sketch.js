const { Engine, World, Bodies, Body, Events } = Matter;

let motor;
let mundo;

let imagenesPersonajes = {};
let imagenesFondos = {};

let estadoJuego = "menu";
let escenarioActual = 0;
let modoCuatroJugadores = true;
let jugador2EsCPU = false;

let seleccionJ1 = 0;
let seleccionJ2 = 1;

let luchadores = [];
let plataformas = [];
let pelotas = [];
let charcos = [];
let particulas = [];
let textosFlotantes = [];

let sacudidaCamara = 0;
let ganadorPartida = null;

const LISTA_ESCENARIOS = [
  { id: "playa", nombre: "Playa Tropical", archivo: "sprites y fondo/fondo/playa.jpg", friccionBase: 0.08 },
  { id: "rocas", nombre: "Cumbre Rocosa", archivo: "sprites y fondo/fondo/rocas.jpg", friccionBase: 0.1 },
  { id: "nieve", nombre: "Glaciar Helado", archivo: "sprites y fondo/fondo/nievo.jpg", friccionBase: 0.025 }
];

const CATALOGO_PERSONAJES = [
  {
    id: "beisbol",
    nombre: "Beisbolista",
    archivo: "sprites y fondo/sprite personajes/beisboll.png",
    color: [235, 65, 65],
    velocidad: 4.8,
    salto: 11.8,
    potenciaLanzamiento: 1.18,
    peso: 1.0
  },
  {
    id: "americano",
    nombre: "Fútbol Americano",
    archivo: "sprites y fondo/sprite personajes/fotball americano.png",
    color: [55, 130, 245],
    velocidad: 4.2,
    salto: 11.0,
    potenciaLanzamiento: 1.25,
    peso: 1.35
  },
  {
    id: "soccer",
    nombre: "Futbolista",
    archivo: "sprites y fondo/sprite personajes/futball socceer.png",
    color: [60, 215, 110],
    velocidad: 5.5,
    salto: 12.4,
    potenciaLanzamiento: 1.12,
    peso: 0.92
  },
  {
    id: "tenista",
    nombre: "Tenista",
    archivo: "sprites y fondo/sprite personajes/tenista.png",
    color: [245, 195, 55],
    velocidad: 5.1,
    salto: 12.0,
    potenciaLanzamiento: 1.2,
    peso: 0.96
  }
];

const CONFIG_ELEMENTOS = {
  fuego: {
    nombre: "Fuego",
    colorPrincipal: [255, 90, 20],
    colorSecundario: [255, 210, 60],
    restitucion: 0.22,
    densidad: 0.0024,
    friccionAire: 0.001,
    friccion: 0.05,
    radio: 15,
    velocidadBase: 16.5,
    danoImpacto: 14,
    empujeBase: 0.042
  },
  piedra: {
    nombre: "Piedra",
    colorPrincipal: [130, 120, 110],
    colorSecundario: [80, 72, 65],
    restitucion: 0.12,
    densidad: 0.0095,
    friccionAire: 0.004,
    friccion: 0.4,
    radio: 19,
    velocidadBase: 12.5,
    danoImpacto: 26,
    empujeBase: 0.095
  },
  nieve: {
    nombre: "Nieve",
    colorPrincipal: [175, 235, 255],
    colorSecundario: [240, 252, 255],
    restitucion: 0.42,
    densidad: 0.0009,
    friccionAire: 0.016,
    friccion: 0.02,
    radio: 15,
    velocidadBase: 13.5,
    danoImpacto: 11,
    empujeBase: 0.032
  },
  agua: {
    nombre: "Agua",
    colorPrincipal: [30, 145, 255],
    colorSecundario: [130, 215, 255],
    restitucion: 0.94,
    densidad: 0.0019,
    friccionAire: 0.002,
    friccion: 0.0001,
    radio: 16,
    velocidadBase: 14.5,
    danoImpacto: 12,
    empujeBase: 0.068
  }
};

const DATOS_SPRITES = {
  beisbol: {
    idle: [[11, 21, 45, 84], [71, 21, 43, 84], [129, 22, 46, 83], [191, 21, 43, 84]],
    run: [[276, 27, 54, 78], [334, 27, 53, 77], [391, 27, 53, 78], [447, 27, 55, 78], [505, 27, 49, 78], [559, 27, 51, 78], [614, 27, 55, 78]],
    jump: [[25, 180, 39, 77], [89, 134, 51, 93], [157, 144, 42, 89], [211, 189, 41, 70]],
    throw: [[296, 170, 52, 89], [360, 178, 59, 82], [433, 178, 70, 82], [515, 181, 74, 80], [612, 178, 45, 84]],
    special: [[22, 291, 49, 76], [106, 288, 47, 79], [185, 281, 43, 86], [272, 280, 45, 87], [348, 288, 70, 78], [432, 288, 71, 79], [516, 289, 60, 78], [611, 283, 48, 84]]
  },
  americano: {
    idle: [[19, 20, 57, 72], [101, 20, 58, 72], [182, 18, 61, 74], [267, 19, 57, 73]],
    run: [[19, 110, 61, 73], [101, 110, 60, 73], [182, 110, 61, 72], [264, 110, 63, 72], [348, 110, 60, 73], [441, 112, 45, 71], [513, 94, 71, 82], [598, 113, 56, 70]],
    jump: [[24, 211, 54, 65], [98, 200, 69, 72], [188, 196, 49, 80]],
    throw: [[344, 201, 64, 75], [422, 201, 76, 75], [510, 201, 77, 74], [597, 200, 64, 75]],
    special: [[14, 294, 63, 74], [98, 294, 66, 74], [184, 294, 63, 74], [263, 294, 66, 74], [340, 293, 75, 75], [421, 293, 81, 75], [507, 292, 78, 76]]
  },
  soccer: {
    idle: [[84, 7, 27, 67], [137, 6, 27, 68], [190, 6, 28, 68], [245, 6, 27, 68], [298, 6, 28, 68], [351, 6, 27, 68]],
    run: [[74, 81, 43, 65], [128, 81, 43, 63], [183, 81, 39, 65], [234, 81, 47, 63], [287, 80, 45, 61], [343, 81, 38, 64], [395, 80, 45, 66], [450, 80, 40, 66], [502, 81, 44, 63], [556, 81, 47, 64]],
    jump: [[87, 167, 30, 53], [140, 164, 30, 56], [191, 152, 31, 64], [242, 148, 29, 55], [295, 149, 33, 54], [351, 161, 29, 59]],
    throw: [[78, 225, 59, 67], [144, 224, 48, 68], [210, 223, 51, 68], [276, 223, 60, 69], [346, 224, 52, 68], [411, 224, 56, 68], [474, 224, 60, 68], [539, 223, 63, 69]],
    special: [[88, 297, 46, 70], [158, 295, 44, 72], [219, 298, 45, 69], [279, 297, 50, 70], [348, 298, 55, 69], [411, 297, 56, 70], [476, 298, 57, 69], [544, 298, 51, 68], [610, 298, 50, 68]]
  },
  tenista: {
    idle: [[15, 12, 49, 60], [83, 12, 49, 60], [150, 12, 49, 61], [217, 12, 50, 61], [285, 12, 49, 61], [352, 12, 49, 61]],
    run: [[13, 86, 52, 59], [73, 86, 60, 59], [156, 85, 46, 60], [210, 85, 50, 60], [274, 85, 63, 60], [344, 86, 59, 59], [409, 85, 62, 60], [476, 85, 63, 60]],
    jump: [[15, 160, 49, 61], [86, 158, 44, 62], [149, 150, 49, 63], [210, 150, 53, 60], [283, 159, 41, 62], [358, 165, 31, 56]],
    throw: [[13, 232, 54, 61], [79, 232, 55, 61], [145, 232, 57, 61], [211, 232, 58, 61], [275, 231, 61, 62], [347, 227, 58, 66], [412, 229, 60, 64], [479, 229, 60, 64]],
    special: [[3, 297, 55, 70], [80, 298, 46, 69], [147, 302, 45, 66], [213, 300, 51, 67], [278, 298, 50, 69], [344, 295, 42, 73], [412, 295, 40, 72], [481, 295, 40, 72], [548, 262, 43, 101], [615, 271, 38, 94]]
  }
};

function preload() {
  for (let p of CATALOGO_PERSONAJES) {
    imagenesPersonajes[p.id] = loadImage(p.archivo);
  }
  for (let esc of LISTA_ESCENARIOS) {
    imagenesFondos[esc.id] = loadImage(esc.archivo);
  }
}

function setup() {
  createCanvas(1080, 680);
  noSmooth();
  motor = Engine.create();
  mundo = motor.world;
  motor.gravity.y = 1.12;
  configurarColisiones();
}

function iniciarPartida() {
  World.clear(mundo, false);
  luchadores = [];
  plataformas = [];
  pelotas = [];
  charcos = [];
  particulas = [];
  textosFlotantes = [];
  ganadorPartida = null;

  crearPlataformasEscenario();

  const controlesJ1 = {
    izquierda: 65,
    derecha: 68,
    saltar: 87,
    ataque: 70,
    especial: 71,
    etiqueta: "J1"
  };

  const controlesJ2 = {
    izquierda: LEFT_ARROW,
    derecha: RIGHT_ARROW,
    saltar: UP_ARROW,
    ataque: 75,
    especial: 76,
    etiqueta: jugador2EsCPU ? "CPU 2" : "J2"
  };

  if (modoCuatroJugadores) {
    let indicesRestantes = [0, 1, 2, 3].filter(i => i !== seleccionJ1 && i !== seleccionJ2);
    if (seleccionJ1 === seleccionJ2) {
      seleccionJ2 = (seleccionJ1 + 1) % 4;
      indicesRestantes = [0, 1, 2, 3].filter(i => i !== seleccionJ1 && i !== seleccionJ2);
    }

    luchadores.push(new Luchador(250, 260, CATALOGO_PERSONAJES[seleccionJ1], controlesJ1, false, 1));
    luchadores.push(new Luchador(830, 260, CATALOGO_PERSONAJES[seleccionJ2], controlesJ2, jugador2EsCPU, 2));
    luchadores.push(new Luchador(430, 180, CATALOGO_PERSONAJES[indicesRestantes[0]], { etiqueta: "CPU 3" }, true, 3));
    luchadores.push(new Luchador(650, 180, CATALOGO_PERSONAJES[indicesRestantes[1]], { etiqueta: "CPU 4" }, true, 4));
  } else {
    luchadores.push(new Luchador(310, 260, CATALOGO_PERSONAJES[seleccionJ1], controlesJ1, false, 1));
    luchadores.push(new Luchador(770, 260, CATALOGO_PERSONAJES[seleccionJ2], controlesJ2, jugador2EsCPU, 2));
  }

  for (let i = 0; i < 3; i++) {
    generarPelotaDelCielo(random(240, width - 240));
  }

  estadoJuego = "jugando";
}

function crearPlataformasEscenario() {
  let esc = LISTA_ESCENARIOS[escenarioActual];

  if (esc.id === "playa") {
    plataformas.push(new Plataforma(width / 2, 560, 780, 36, [218, 178, 108], [65, 175, 85], true));
    plataformas.push(new Plataforma(280, 415, 200, 20, [160, 105, 55], [75, 190, 95], false));
    plataformas.push(new Plataforma(800, 415, 200, 20, [160, 105, 55], [75, 190, 95], false));
    plataformas.push(new Plataforma(width / 2, 285, 230, 20, [160, 105, 55], [75, 190, 95], false));
  } else if (esc.id === "rocas") {
    plataformas.push(new Plataforma(width / 2, 565, 740, 38, [105, 92, 82], [140, 125, 110], true));
    plataformas.push(new Plataforma(265, 395, 190, 22, [95, 84, 76], [130, 115, 102], false));
    plataformas.push(new Plataforma(815, 355, 210, 22, [95, 84, 76], [130, 115, 102], false));
    plataformas.push(new Plataforma(530, 445, 200, 22, [95, 84, 76], [130, 115, 102], false));
  } else {
    plataformas.push(new Plataforma(width / 2, 560, 800, 36, [135, 195, 235], [220, 245, 255], true));
    plataformas.push(new Plataforma(300, 410, 210, 20, [120, 180, 225], [210, 240, 255], false));
    plataformas.push(new Plataforma(780, 410, 210, 20, [120, 180, 225], [210, 240, 255], false));
    plataformas.push(new Plataforma(width / 2, 275, 220, 20, [120, 180, 225], [210, 240, 255], false));
  }
}

function configurarColisiones() {
  Events.on(motor, "collisionStart", evento => {
    for (let par of evento.pairs) {
      procesarColisionPar(par.bodyA, par.bodyB);
    }
  });
}

function procesarColisionPar(cuerpoA, cuerpoB) {
  let pelota = cuerpoA.entidadPelota || cuerpoB.entidadPelota;
  let luchador = cuerpoA.entidadLuchador || cuerpoB.entidadLuchador;
  let plataforma = cuerpoA.entidadPlataforma || cuerpoB.entidadPlataforma;

  if (pelota && luchador) {
    pelota.alImpactarLuchador(luchador);
  } else if (pelota && plataforma) {
    pelota.alImpactarPlataforma(plataforma);
  }
}

function draw() {
  background(12, 16, 26);

  if (estadoJuego === "menu") {
    dibujarMenu();
    return;
  }

  Engine.update(motor, 1000 / 60);

  push();
  if (sacudidaCamara > 0.5) {
    translate(random(-sacudidaCamara, sacudidaCamara), random(-sacudidaCamara, sacudidaCamara));
    sacudidaCamara *= 0.86;
  } else {
    sacudidaCamara = 0;
  }

  dibujarEscenario();
  actualizarCharcos();
  actualizarPelotas();
  actualizarLuchadores();
  actualizarParticulas();
  actualizarTextosFlotantes();
  pop();

  dibujarHUD();
  dibujarLeyendaElementos();

  if (estadoJuego === "jugando") {
    controlarAparicionPelotas();
    verificarFinPartida();
  } else if (estadoJuego === "fin") {
    dibujarPantallaVictoria();
  }
}

function dibujarEscenario() {
  let esc = LISTA_ESCENARIOS[escenarioActual];
  let img = imagenesFondos[esc.id];
  if (img) {
    imageMode(CORNER);
    image(img, 0, 0, width, height);
  }

  fill(8, 12, 22, 65);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);

  for (let plat of plataformas) {
    plat.mostrar();
  }
}

function controlarAparicionPelotas() {
  let maxPelotas = modoCuatroJugadores ? 6 : 5;
  if (frameCount % 135 === 0 && pelotas.length < maxPelotas) {
    generarPelotaDelCielo(random(190, width - 190));
  }
}

function generarPelotaDelCielo(x) {
  const tipos = ["fuego", "piedra", "nieve", "agua"];
  let tipo = random(tipos);
  pelotas.push(new PelotaElemental(x, -30, tipo));
}

function actualizarCharcos() {
  for (let i = charcos.length - 1; i >= 0; i--) {
    charcos[i].actualizar();
    charcos[i].mostrar();
    if (charcos[i].terminado()) {
      charcos.splice(i, 1);
    }
  }
}

function actualizarPelotas() {
  for (let i = pelotas.length - 1; i >= 0; i--) {
    let p = pelotas[i];
    p.actualizar();
    p.mostrar();
    if (p.fueraDeLimites() || p.destruida) {
      p.eliminarDelMundo();
      pelotas.splice(i, 1);
    }
  }
}

function actualizarLuchadores() {
  for (let l of luchadores) {
    l.actualizar();
    l.mostrar();
  }
}

function actualizarParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].actualizar();
    particulas[i].mostrar();
    if (particulas[i].terminada()) {
      particulas.splice(i, 1);
    }
  }
}

function actualizarTextosFlotantes() {
  for (let i = textosFlotantes.length - 1; i >= 0; i--) {
    textosFlotantes[i].actualizar();
    textosFlotantes[i].mostrar();
    if (textosFlotantes[i].terminado()) {
      textosFlotantes.splice(i, 1);
    }
  }
}

function verificarFinPartida() {
  let vivos = luchadores.filter(l => l.vidas > 0);
  if (vivos.length <= 1) {
    ganadorPartida = vivos[0] || luchadores[0];
    estadoJuego = "fin";
  }
}

function crearExplosionParticulas(x, y, colorRGB, cantidad, velocidadMax = 5, tamMax = 8) {
  for (let i = 0; i < cantidad; i++) {
    particulas.push(new Particula(x, y, colorRGB, velocidadMax, tamMax));
  }
}

function agregarTextoFlotante(x, y, texto, colorRGB, tam = 18) {
  textosFlotantes.push(new TextoFlotante(x, y, texto, colorRGB, tam));
}

class Plataforma {
  constructor(x, y, w, h, colorBase, colorBorde, esPrincipal) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorBase = colorBase;
    this.colorBorde = colorBorde;
    this.esPrincipal = esPrincipal;
    this.cuerpo = Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      friction: 0.05,
      restitution: 0.2,
      label: "plataforma"
    });
    this.cuerpo.entidadPlataforma = this;
    World.add(mundo, this.cuerpo);
  }

  mostrar() {
    push();
    rectMode(CENTER);
    noStroke();
    fill(0, 0, 0, 90);
    rect(this.x, this.y + 6, this.w, this.h, 8);

    stroke(25, 30, 40, 200);
    strokeWeight(2);
    fill(this.colorBase[0], this.colorBase[1], this.colorBase[2]);
    rect(this.x, this.y, this.w, this.h, 8);

    noStroke();
    fill(this.colorBorde[0], this.colorBorde[1], this.colorBorde[2]);
    rect(this.x, this.y - this.h / 2 + 5, this.w - 4, 9, 6);
    pop();
  }
}

class CharcoAgua {
  constructor(x, y, ancho) {
    this.x = x;
    this.y = y;
    this.ancho = ancho;
    this.vida = 360;
    this.vidaMax = 360;
  }

  actualizar() {
    this.vida--;
    if (frameCount % 12 === 0) {
      particulas.push(new Particula(this.x + random(-this.ancho * 0.4, this.ancho * 0.4), this.y - 2, [120, 210, 255], 1.5, 5));
    }
  }

  mostrar() {
    push();
    noStroke();
    let alfa = map(this.vida, 0, 60, 0, 195, true);
    fill(30, 160, 255, alfa);
    ellipse(this.x, this.y, this.ancho, 10);
    fill(170, 235, 255, alfa * 0.8);
    ellipse(this.x - this.ancho * 0.12, this.y - 1, this.ancho * 0.55, 5);
    pop();
  }

  contienePunto(px, py) {
    return abs(px - this.x) < this.ancho * 0.55 && abs(py - this.y) < 28;
  }

  terminado() {
    return this.vida <= 0;
  }
}

class PelotaElemental {
  constructor(x, y, tipo) {
    this.tipo = tipo;
    this.cfg = CONFIG_ELEMENTOS[tipo];
    this.radio = this.cfg.radio;
    this.portador = null;
    this.lanzador = null;
    this.activaParaDano = false;
    this.esEspecial = false;
    this.destruida = false;
    this.tiempoViva = 0;
    this.rebotesActivos = 0;

    this.cuerpo = Bodies.circle(x, y, this.radio, {
      restitution: this.cfg.restitucion,
      density: this.cfg.densidad,
      frictionAir: this.cfg.friccionAire,
      friction: this.cfg.friccion,
      label: "pelota"
    });
    this.cuerpo.entidadPelota = this;
    World.add(mundo, this.cuerpo);
  }

  actualizar() {
    this.tiempoViva++;

    if (this.portador) {
      let dir = this.portador.direccion;
      let px = this.portador.cuerpo.position.x + dir * 24;
      let py = this.portador.cuerpo.position.y - 8;
      Body.setPosition(this.cuerpo, { x: px, y: py });
      Body.setVelocity(this.cuerpo, { x: 0, y: 0 });
      return;
    }

    let vel = this.cuerpo.velocity;
    let rapidez = Math.hypot(vel.x, vel.y);

    if (this.activaParaDano && rapidez < 2.2 && this.tiempoViva > 25) {
      this.activaParaDano = false;
      this.esEspecial = false;
      this.lanzador = null;
    }

    if (this.activaParaDano || frameCount % 4 === 0) {
      let cant = this.activaParaDano ? 2 : 1;
      crearExplosionParticulas(
        this.cuerpo.position.x,
        this.cuerpo.position.y,
        this.cfg.colorPrincipal,
        cant,
        this.activaParaDano ? 2.6 : 1.2,
        this.esEspecial ? 9 : 6
      );
    }

    if (this.tiempoViva > 1100 && !this.activaParaDano) {
      this.destruida = true;
    }
  }

  serRecogidaPor(luchador) {
    this.portador = luchador;
    this.lanzador = luchador;
    this.activaParaDano = false;
    this.esEspecial = false;
    this.cuerpo.isSensor = true;
  }

  serLanzada(luchador, direccion, esEspecial) {
    this.portador = null;
    this.lanzador = luchador;
    this.activaParaDano = true;
    this.esEspecial = esEspecial;
    this.rebotesActivos = 0;
    this.tiempoViva = 0;
    this.cuerpo.isSensor = false;

    let multEspecial = esEspecial ? 1.42 : 1.0;
    let potJugador = luchador.datos.potenciaLanzamiento;
    let velX = direccion * this.cfg.velocidadBase * potJugador * multEspecial;
    let velY = this.tipo === "piedra" ? -3.4 : (esEspecial ? -1.5 : -2.4);

    Body.setPosition(this.cuerpo, {
      x: luchador.cuerpo.position.x + direccion * 36,
      y: luchador.cuerpo.position.y - 10
    });
    Body.setVelocity(this.cuerpo, { x: velX, y: velY });
    Body.setAngularVelocity(this.cuerpo, direccion * 0.28);

    crearExplosionParticulas(this.cuerpo.position.x, this.cuerpo.position.y, this.cfg.colorSecundario, 12, 4.5, 8);
  }

  alImpactarPlataforma(plataforma) {
    if (this.portador) return;

    let pos = this.cuerpo.position;
    if (this.tipo === "agua" && (this.activaParaDano || Math.abs(this.cuerpo.velocity.y) > 4.5)) {
      if (pos.y <= plataforma.y) {
        let xCharco = constrain(pos.x, plataforma.x - plataforma.w * 0.42, plataforma.x + plataforma.w * 0.42);
        charcos.push(new CharcoAgua(xCharco, plataforma.y - plataforma.h / 2, this.esEspecial ? 135 : 95));
        crearExplosionParticulas(pos.x, pos.y, this.cfg.colorPrincipal, 14, 4, 7);
      }
    }

    if (this.activaParaDano) {
      this.rebotesActivos++;
      if (this.tipo === "piedra") {
        sacudidaCamara = max(sacudidaCamara, 5);
        crearExplosionParticulas(pos.x, pos.y, this.cfg.colorPrincipal, 10, 3.5, 7);
      }
      let maxRebotes = this.tipo === "agua" ? 5 : (this.tipo === "piedra" ? 1 : 2);
      if (this.rebotesActivos >= maxRebotes) {
        this.activaParaDano = false;
        this.esEspecial = false;
      }
    }
  }

  alImpactarLuchador(objetivo) {
    if (this.portador || objetivo.vidas <= 0 || objetivo.invencible > 0) return;

    let vel = this.cuerpo.velocity;
    let rapidez = Math.hypot(vel.x, vel.y);
    let caidaFuerte = !this.lanzador && vel.y > 6.5;

    if (!this.activaParaDano && !caidaFuerte) return;
    if (this.lanzador === objetivo && this.tiempoViva < 18) return;

    let mult = this.esEspecial ? 1.45 : (caidaFuerte ? 0.65 : 1.0);
    let danoTotal = round(this.cfg.danoImpacto * mult);
    objetivo.porcentajeDano = min(999, objetivo.porcentajeDano + danoTotal);
    objetivo.aturdido = this.tipo === "piedra" ? 28 : 16;

    let dirImpacto = vel.x >= 0 ? 1 : -1;
    if (abs(vel.x) < 0.8) {
      dirImpacto = objetivo.cuerpo.position.x >= this.cuerpo.position.x ? 1 : -1;
    }

    let escalaPorcentaje = 1 + objetivo.porcentajeDano / 75;
    let magnitudFuerza = (this.cfg.empujeBase * mult * escalaPorcentaje) / objetivo.datos.peso;

    Body.setVelocity(objetivo.cuerpo, { x: 0, y: -3.5 });
    Body.applyForce(objetivo.cuerpo, objetivo.cuerpo.position, {
      x: dirImpacto * magnitudFuerza,
      y: -magnitudFuerza * (this.tipo === "piedra" ? 0.72 : 0.52)
    });

    this.aplicarReaccionElemental(objetivo, dirImpacto);

    crearExplosionParticulas(objetivo.cuerpo.position.x, objetivo.cuerpo.position.y, this.cfg.colorPrincipal, 24, 6.5, 9);

    if (this.tipo === "agua" && this.rebotesActivos < 3) {
      this.rebotesActivos++;
      Body.setVelocity(this.cuerpo, { x: -vel.x * 0.85, y: -6.5 });
    } else {
      this.destruida = true;
    }
  }

  aplicarReaccionElemental(objetivo, dirImpacto) {
    let px = objetivo.cuerpo.position.x;
    let py = objetivo.cuerpo.position.y - 35;

    if (this.tipo === "fuego") {
      objetivo.tiempoQuemadura = this.esEspecial ? 240 : 180;
      sacudidaCamara = max(sacudidaCamara, 6);
      agregarTextoFlotante(px, py, "¡QUEMADURA!", [255, 110, 30], 19);
    } else if (this.tipo === "piedra") {
      sacudidaCamara = max(sacudidaCamara, this.esEspecial ? 16 : 11);
      agregarTextoFlotante(px, py, "¡IMPACTO PESADO!", [210, 195, 175], 21);
    } else if (this.tipo === "nieve") {
      objetivo.tiempoCongelado = this.esEspecial ? 230 : 170;
      sacudidaCamara = max(sacudidaCamara, 5);
      agregarTextoFlotante(px, py, "¡CONGELADO!", [150, 235, 255], 19);
    } else if (this.tipo === "agua") {
      objetivo.tiempoResbaloso = 210;
      sacudidaCamara = max(sacudidaCamara, 7);
      charcos.push(new CharcoAgua(objetivo.cuerpo.position.x, objetivo.cuerpo.position.y + 28, 120));
      Body.setVelocity(objetivo.cuerpo, {
        x: dirImpacto * (this.esEspecial ? 15 : 11.5),
        y: objetivo.cuerpo.velocity.y - 2
      });
      agregarTextoFlotante(px, py, "¡EMPUJÓN Y RESBALÓN!", [80, 195, 255], 19);
    }
  }

  mostrar() {
    let pos = this.cuerpo.position;
    let ang = this.cuerpo.angle;

    if (pos.y < 15 && !this.portador) {
      push();
      fill(this.cfg.colorPrincipal[0], this.cfg.colorPrincipal[1], this.cfg.colorPrincipal[2], 220);
      noStroke();
      triangle(pos.x, 28, pos.x - 10, 10, pos.x + 10, 10);
      pop();
    }

    push();
    translate(pos.x, pos.y);
    rotate(ang);

    if (this.activaParaDano) {
      noFill();
      stroke(this.cfg.colorSecundario[0], this.cfg.colorSecundario[1], this.cfg.colorSecundario[2], 190);
      strokeWeight(this.esEspecial ? 4 : 2.5);
      ellipse(0, 0, this.radio * 2.5, this.radio * 2.5);
    }

    noStroke();
    fill(this.cfg.colorPrincipal[0], this.cfg.colorPrincipal[1], this.cfg.colorPrincipal[2]);
    ellipse(0, 0, this.radio * 2, this.radio * 2);

    fill(this.cfg.colorSecundario[0], this.cfg.colorSecundario[1], this.cfg.colorSecundario[2]);
    if (this.tipo === "fuego") {
      ellipse(-3, -3, this.radio * 1.15, this.radio * 1.15);
      fill(255, 250, 190);
      ellipse(-4, -4, this.radio * 0.55, this.radio * 0.55);
    } else if (this.tipo === "piedra") {
      rectMode(CENTER);
      rect(-3, -3, this.radio * 0.9, this.radio * 0.9, 3);
      stroke(50, 45, 40);
      strokeWeight(2);
      line(-6, -4, 4, 5);
      line(5, -6, -2, 4);
    } else if (this.tipo === "nieve") {
      ellipse(-3, -3, this.radio * 1.2, this.radio * 1.2);
      stroke(255);
      strokeWeight(2);
      line(-7, 0, 7, 0);
      line(0, -7, 0, 7);
    } else if (this.tipo === "agua") {
      ellipse(-4, -4, this.radio * 0.95, this.radio * 0.95);
      fill(255, 255, 255, 210);
      ellipse(-5, -5, this.radio * 0.45, this.radio * 0.45);
    }
    pop();
  }

  fueraDeLimites() {
    let pos = this.cuerpo.position;
    return pos.y > height + 120 || pos.x < -150 || pos.x > width + 150;
  }

  eliminarDelMundo() {
    if (this.portador && this.portador.pelotaEnMano === this) {
      this.portador.pelotaEnMano = null;
    }
    World.remove(mundo, this.cuerpo);
  }
}

class Luchador {
  constructor(x, y, datosPersonaje, controles, esCPU, numeroJugador) {
    this.datos = datosPersonaje;
    this.controles = controles;
    this.esCPU = esCPU;
    this.numeroJugador = numeroJugador;

    this.anchoFisico = 36;
    this.altoFisico = 64;

    this.cuerpo = Bodies.rectangle(x, y, this.anchoFisico, this.altoFisico, {
      inertia: Infinity,
      friction: 0.04,
      frictionAir: 0.018,
      restitution: 0.05,
      density: 0.0022 * this.datos.peso,
      label: "luchador"
    });
    this.cuerpo.entidadLuchador = this;
    World.add(mundo, this.cuerpo);

    this.vidas = 3;
    this.porcentajeDano = 0;
    this.direccion = numeroJugador % 2 === 1 ? 1 : -1;
    this.saltosDisponibles = 2;
    this.enSuelo = false;

    this.pelotaEnMano = null;
    this.estadoAnimacion = "idle";
    this.frameAnimacion = 0;
    this.temporizadorAtaque = 0;
    this.tipoAtaqueActual = "throw";

    this.tiempoQuemadura = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;
    this.aturdido = 0;
    this.invencible = 60;

    this.temporizadorIA = 0;
  }

  actualizar() {
    if (this.vidas <= 0) return;

    this.verificarSuelo();
    this.actualizarEfectosEstado();

    if (this.aturdido > 0) {
      this.aturdido--;
    } else if (this.esCPU) {
      this.ejecutarIA();
    } else {
      this.leerControles();
    }

    this.actualizarAnimacion();
    this.verificarCaidaFuera();
  }

  verificarSuelo() {
    let pos = this.cuerpo.position;
    let piesY = pos.y + this.altoFisico / 2;
    this.enSuelo = false;

    for (let plat of plataformas) {
      let topeY = plat.y - plat.h / 2;
      let dentroX = Math.abs(pos.x - plat.x) <= plat.w / 2 + this.anchoFisico * 0.35;
      let cercaY = Math.abs(piesY - topeY) <= 10 && this.cuerpo.velocity.y >= -0.5;
      if (dentroX && cercaY) {
        this.enSuelo = true;
        this.saltosDisponibles = 2;
        break;
      }
    }
  }

  sobreCharcoAgua() {
    let pos = this.cuerpo.position;
    let piesY = pos.y + this.altoFisico / 2;
    for (let c of charcos) {
      if (c.contienePunto(pos.x, piesY)) return true;
    }
    return false;
  }

  actualizarEfectosEstado() {
    if (this.invencible > 0) this.invencible--;
    if (this.tiempoResbaloso > 0) this.tiempoResbaloso--;

    let pos = this.cuerpo.position;

    if (this.tiempoQuemadura > 0) {
      this.tiempoQuemadura--;
      if (this.tiempoQuemadura % 35 === 0) {
        this.porcentajeDano = min(999, this.porcentajeDano + 3);
        agregarTextoFlotante(pos.x, pos.y - 40, "+3% 🔥", [255, 110, 30], 15);
      }
      if (frameCount % 5 === 0) {
        crearExplosionParticulas(pos.x + random(-14, 14), pos.y + random(-20, 20), [255, 100, 20], 1, 2, 6);
      }
    }

    if (this.tiempoCongelado > 0) {
      this.tiempoCongelado--;
      if (frameCount % 6 === 0) {
        crearExplosionParticulas(pos.x + random(-14, 14), pos.y + random(-20, 20), [180, 240, 255], 1, 1.4, 5);
      }
    }

    if (!this.pelotaEnMano) {
      this.intentarRecogerAutomatico();
    }
  }

  intentarRecogerAutomatico() {
    let pos = this.cuerpo.position;
    for (let p of pelotas) {
      if (!p.portador && !p.activaParaDano && !p.destruida) {
        let d = dist(pos.x, pos.y, p.cuerpo.position.x, p.cuerpo.position.y);
        if (d < 44) {
          this.pelotaEnMano = p;
          p.serRecogidaPor(this);
          agregarTextoFlotante(pos.x, pos.y - 42, p.cfg.nombre.toUpperCase(), p.cfg.colorSecundario, 15);
          break;
        }
      }
    }
  }

  leerControles() {
    let mov = 0;
    if (keyIsDown(this.controles.izquierda)) {
      mov = -1;
      this.direccion = -1;
    } else if (keyIsDown(this.controles.derecha)) {
      mov = 1;
      this.direccion = 1;
    }
    this.aplicarMovimientoHorizontal(mov);
  }

  aplicarMovimientoHorizontal(mov) {
    let factorNieve = this.tiempoCongelado > 0 ? 0.42 : 1.0;
    let velObjetivo = mov * this.datos.velocidad * factorNieve;
    let velActualX = this.cuerpo.velocity.x;

    let enSuperficieResbalosa =
      this.tiempoResbaloso > 0 ||
      this.sobreCharcoAgua() ||
      LISTA_ESCENARIOS[escenarioActual].id === "nieve";

    let aceleracion = enSuperficieResbalosa ? 0.045 : 0.24;
    if (mov === 0 && enSuperficieResbalosa) {
      aceleracion = 0.015;
    }

    let nuevaVelX = lerp(velActualX, velObjetivo, aceleracion);
    Body.setVelocity(this.cuerpo, { x: nuevaVelX, y: this.cuerpo.velocity.y });
  }

  saltar() {
    if (this.vidas <= 0 || this.aturdido > 0) return;
    if (this.saltosDisponibles > 0) {
      let factorNieve = this.tiempoCongelado > 0 ? 0.72 : 1.0;
      Body.setVelocity(this.cuerpo, {
        x: this.cuerpo.velocity.x,
        y: -this.datos.salto * factorNieve
      });
      this.saltosDisponibles--;
      this.enSuelo = false;
      crearExplosionParticulas(this.cuerpo.position.x, this.cuerpo.position.y + 28, [220, 230, 245], 6, 2.5, 5);
    }
  }

  ejecutarAccionAtaque(esEspecial) {
    if (this.vidas <= 0 || this.aturdido > 0 || this.temporizadorAtaque > 0) return;

    this.tipoAtaqueActual = esEspecial ? "special" : "throw";
    this.temporizadorAtaque = esEspecial ? 24 : 18;
    this.frameAnimacion = 0;

    if (this.pelotaEnMano) {
      let pelota = this.pelotaEnMano;
      this.pelotaEnMano = null;
      pelota.serLanzada(this, this.direccion, esEspecial);
    } else {
      this.golpeCuerpoACuerpo(esEspecial);
    }
  }

  golpeCuerpoACuerpo(esEspecial) {
    let pos = this.cuerpo.position;
    let alcanceX = pos.x + this.direccion * 44;
    let alcanceY = pos.y;

    for (let p of pelotas) {
      if (!p.portador && dist(alcanceX, alcanceY, p.cuerpo.position.x, p.cuerpo.position.y) < 62) {
        p.serLanzada(this, this.direccion, true);
        agregarTextoFlotante(pos.x, pos.y - 45, "¡REBOTE!", [255, 235, 90], 17);
        return;
      }
    }

    for (let otro of luchadores) {
      if (otro !== this && otro.vidas > 0 && otro.invencible <= 0) {
        let d = dist(alcanceX, alcanceY, otro.cuerpo.position.x, otro.cuerpo.position.y);
        if (d < 58) {
          let dano = esEspecial ? 12 : 7;
          otro.porcentajeDano = min(999, otro.porcentajeDano + dano);
          otro.aturdido = 14;
          let escala = 1 + otro.porcentajeDano / 85;
          let fuerza = (esEspecial ? 0.048 : 0.032) * escala / otro.datos.peso;
          Body.setVelocity(otro.cuerpo, { x: 0, y: -3 });
          Body.applyForce(otro.cuerpo, otro.cuerpo.position, {
            x: this.direccion * fuerza,
            y: -fuerza * 0.45
          });
          crearExplosionParticulas(otro.cuerpo.position.x, otro.cuerpo.position.y, this.datos.color, 14, 4.5, 7);
        }
      }
    }
  }

  ejecutarIA() {
    this.temporizadorIA++;
    let pos = this.cuerpo.position;

    if (pos.x < 180) {
      this.direccion = 1;
      this.aplicarMovimientoHorizontal(1);
      if (pos.y > 420 && this.temporizadorIA % 18 === 0) this.saltar();
      return;
    }
    if (pos.x > width - 180) {
      this.direccion = -1;
      this.aplicarMovimientoHorizontal(-1);
      if (pos.y > 420 && this.temporizadorIA % 18 === 0) this.saltar();
      return;
    }

    let enemigoMasCercano = null;
    let distEnemigo = 9999;
    for (let otro of luchadores) {
      if (otro !== this && otro.vidas > 0) {
        let d = dist(pos.x, pos.y, otro.cuerpo.position.x, otro.cuerpo.position.y);
        if (d < distEnemigo) {
          distEnemigo = d;
          enemigoMasCercano = otro;
        }
      }
    }

    if (!this.pelotaEnMano) {
      let pelotaCercana = null;
      let distPelota = 9999;
      for (let p of pelotas) {
        if (!p.portador && !p.activaParaDano && p.cuerpo.position.y < 570) {
          let d = dist(pos.x, pos.y, p.cuerpo.position.x, p.cuerpo.position.y);
          if (d < distPelota) {
            distPelota = d;
            pelotaCercana = p;
          }
        }
      }

      if (pelotaCercana && distPelota < 380) {
        let dx = pelotaCercana.cuerpo.position.x - pos.x;
        this.direccion = dx >= 0 ? 1 : -1;
        this.aplicarMovimientoHorizontal(this.direccion);
        if (pelotaCercana.cuerpo.position.y < pos.y - 45 && this.temporizadorIA % 28 === 0) {
          this.saltar();
        }
        return;
      }
    }

    if (enemigoMasCercano) {
      let dx = enemigoMasCercano.cuerpo.position.x - pos.x;
      let dy = enemigoMasCercano.cuerpo.position.y - pos.y;
      this.direccion = dx >= 0 ? 1 : -1;

      if (this.pelotaEnMano) {
        if (abs(dx) > 260) {
          this.aplicarMovimientoHorizontal(this.direccion);
        } else {
          this.aplicarMovimientoHorizontal(0);
        }
        if (abs(dy) < 95 && this.temporizadorIA % 22 === 0) {
          this.ejecutarAccionAtaque(random() < 0.45);
        } else if (dy < -55 && this.temporizadorIA % 30 === 0) {
          this.saltar();
        }
      } else {
        if (abs(dx) > 52) {
          this.aplicarMovimientoHorizontal(this.direccion);
        } else {
          this.aplicarMovimientoHorizontal(0);
          if (this.temporizadorIA % 20 === 0) {
            this.ejecutarAccionAtaque(random() < 0.35);
          }
        }
        if (dy < -60 && this.temporizadorIA % 32 === 0) {
          this.saltar();
        }
      }
    }
  }

  actualizarAnimacion() {
    if (this.temporizadorAtaque > 0) {
      this.temporizadorAtaque--;
      this.estadoAnimacion = this.tipoAtaqueActual;
    } else if (!this.enSuelo) {
      this.estadoAnimacion = "jump";
    } else if (abs(this.cuerpo.velocity.x) > 0.75) {
      this.estadoAnimacion = "run";
    } else {
      this.estadoAnimacion = "idle";
    }

    let velocidadFrame = this.estadoAnimacion === "idle" ? 10 : 6;
    if (frameCount % velocidadFrame === 0) {
      this.frameAnimacion++;
    }
  }

  verificarCaidaFuera() {
    let pos = this.cuerpo.position;
    if (pos.y > height + 90 || pos.x < -120 || pos.x > width + 120 || pos.y < -220) {
      this.perderVida();
    }
  }

  perderVida() {
    let pos = this.cuerpo.position;
    crearExplosionParticulas(constrain(pos.x, 40, width - 40), constrain(pos.y, 40, height - 40), this.datos.color, 38, 9, 12);
    sacudidaCamara = 18;

    if (this.pelotaEnMano) {
      this.pelotaEnMano.portador = null;
      this.pelotaEnMano.cuerpo.isSensor = false;
      this.pelotaEnMano = null;
    }

    this.vidas--;
    this.porcentajeDano = 0;
    this.tiempoQuemadura = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;
    this.aturdido = 0;

    if (this.vidas > 0) {
      Body.setPosition(this.cuerpo, { x: width / 2 + random(-140, 140), y: 120 });
      Body.setVelocity(this.cuerpo, { x: 0, y: 0 });
      this.invencible = 110;
      agregarTextoFlotante(width / 2, 140, this.controles.etiqueta + " REAPARECE", this.datos.color, 18);
    } else {
      World.remove(mundo, this.cuerpo);
      agregarTextoFlotante(width / 2, height / 2, "¡" + this.controles.etiqueta + " ELIMINADO!", this.datos.color, 24);
    }
  }

  mostrar() {
    if (this.vidas <= 0) return;
    if (this.invencible > 0 && frameCount % 6 < 3) return;

    let pos = this.cuerpo.position;
    let hoja = imagenesPersonajes[this.datos.id];
    let listaFrames = DATOS_SPRITES[this.datos.id][this.estadoAnimacion];
    let recorte = listaFrames[this.frameAnimacion % listaFrames.length];

    push();
    translate(pos.x, pos.y);

    noStroke();
    fill(0, 0, 0, 85);
    ellipse(0, this.altoFisico / 2 - 2, 40, 10);

    push();
    scale(this.direccion, 1);
    if (this.tiempoQuemadura > 0) {
      tint(255, 145, 95);
    } else if (this.tiempoCongelado > 0) {
      tint(135, 220, 255);
    } else if (this.tiempoResbaloso > 0) {
      tint(175, 225, 255);
    }

    let escalaVisual = 1.05;
    let dw = recorte[2] * escalaVisual;
    let dh = recorte[3] * escalaVisual;
    imageMode(CENTER);
    image(hoja, 0, (this.altoFisico - dh) * 0.42, dw, dh, recorte[0], recorte[1], recorte[2], recorte[3]);
    noTint();
    pop();

    this.dibujarIndicadorJugador();
    pop();
  }

  dibujarIndicadorJugador() {
    let c = this.datos.color;
    fill(c[0], c[1], c[2]);
    noStroke();
    triangle(0, -44, -6, -54, 6, -54);

    textAlign(CENTER, BOTTOM);
    textSize(12);
    textStyle(BOLD);
    fill(255);
    text(this.controles.etiqueta, 0, -56);

    let etiquetasEstado = [];
    if (this.tiempoQuemadura > 0) etiquetasEstado.push("🔥");
    if (this.tiempoCongelado > 0) etiquetasEstado.push("❄️");
    if (this.tiempoResbaloso > 0 || this.sobreCharcoAgua()) etiquetasEstado.push("💧");
    if (etiquetasEstado.length > 0) {
      textSize(14);
      text(etiquetasEstado.join(""), 0, -70);
    }
  }
}

class Particula {
  constructor(x, y, colorRGB, velMax, tamMax) {
    this.x = x;
    this.y = y;
    let ang = random(TWO_PI);
    let mag = random(0.6, velMax);
    this.vx = cos(ang) * mag;
    this.vy = sin(ang) * mag - 0.8;
    this.color = colorRGB;
    this.tam = random(3, tamMax);
    this.vida = 28;
    this.vidaMax = 28;
  }

  actualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12;
    this.vida--;
  }

  mostrar() {
    push();
    noStroke();
    let alfa = map(this.vida, 0, this.vidaMax, 0, 240);
    fill(this.color[0], this.color[1], this.color[2], alfa);
    ellipse(this.x, this.y, this.tam, this.tam);
    pop();
  }

  terminada() {
    return this.vida <= 0;
  }
}

class TextoFlotante {
  constructor(x, y, texto, colorRGB, tam) {
    this.x = x;
    this.y = y;
    this.texto = texto;
    this.color = colorRGB;
    this.tam = tam;
    this.vida = 50;
  }

  actualizar() {
    this.y -= 1.1;
    this.vida--;
  }

  mostrar() {
    push();
    textAlign(CENTER, CENTER);
    textSize(this.tam);
    textStyle(BOLD);
    let alfa = map(this.vida, 0, 50, 0, 255);
    fill(0, 0, 0, alfa);
    text(this.texto, this.x + 2, this.y + 2);
    fill(this.color[0], this.color[1], this.color[2], alfa);
    text(this.texto, this.x, this.y);
    pop();
  }

  terminado() {
    return this.vida <= 0;
  }
}

function dibujarHUD() {
  let cant = luchadores.length;
  let anchoPanel = 225;
  let espaciado = 20;
  let anchoTotal = cant * anchoPanel + (cant - 1) * espaciado;
  let inicioX = (width - anchoTotal) / 2;
  let posY = height - 82;

  for (let i = 0; i < cant; i++) {
    let l = luchadores[i];
    let x = inicioX + i * (anchoPanel + espaciado);
    let c = l.datos.color;

    push();
    rectMode(CORNER);
    stroke(c[0], c[1], c[2], 210);
    strokeWeight(2.5);
    fill(14, 19, 32, 215);
    rect(x, posY, anchoPanel, 68, 12);

    let hoja = imagenesPersonajes[l.datos.id];
    let rec = DATOS_SPRITES[l.datos.id].idle[0];
    imageMode(CENTER);
    image(hoja, x + 32, posY + 35, 36, 52, rec[0], rec[1], rec[2], rec[3]);

    noStroke();
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(13);
    fill(c[0], c[1], c[2]);
    text(l.controles.etiqueta + " · " + l.datos.nombre, x + 60, posY + 8);

    let rDano = constrain(map(l.porcentajeDano, 0, 150, 255, 255), 0, 255);
    let gDano = constrain(map(l.porcentajeDano, 0, 150, 255, 45), 0, 255);
    let bDano = constrain(map(l.porcentajeDano, 0, 150, 255, 45), 0, 255);
    fill(rDano, gDano, bDano);
    textSize(26);
    text(l.vidas > 0 ? l.porcentajeDano + "%" : "KO", x + 60, posY + 24);

    for (let v = 0; v < l.vidas; v++) {
      fill(c[0], c[1], c[2]);
      ellipse(x + 165 + v * 18, posY + 42, 12, 12);
    }

    if (l.pelotaEnMano) {
      let cfg = l.pelotaEnMano.cfg;
      fill(cfg.colorPrincipal[0], cfg.colorPrincipal[1], cfg.colorPrincipal[2]);
      ellipse(x + anchoPanel - 22, posY + 18, 14, 14);
    }
    pop();
  }
}

function dibujarLeyendaElementos() {
  push();
  rectMode(CORNER);
  fill(12, 16, 28, 190);
  stroke(255, 255, 255, 45);
  strokeWeight(1);
  rect(14, 12, width - 28, 34, 8);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(12);
  textStyle(BOLD);
  fill(235);
  text(
    "🔥 Fuego: Rápida + Quemadura   |   🪨 Piedra: Pesada + Gran Knockback   |   ❄️ Nieve: Ligera + Congela   |   💧 Agua: Rebota + Suelo Resbaloso",
    28,
    29
  );

  textAlign(RIGHT, CENTER);
  fill(190, 215, 255);
  text("[ESC] Menú", width - 26, 29);
  pop();
}

function dibujarMenu() {
  let esc = LISTA_ESCENARIOS[escenarioActual];
  let imgFondo = imagenesFondos[esc.id];
  if (imgFondo) {
    imageMode(CORNER);
    image(imgFondo, 0, 0, width, height);
  }

  fill(10, 14, 26, 205);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255, 195, 50);
  textSize(48);
  text("ELEMENTAL SMASH", width / 2, 58);

  fill(200, 220, 255);
  textSize(16);
  text("Batalla Física 2D con p5.js + Matter.js · Deportistas vs Pelotas Elementales", width / 2, 98);

  let anchoCarta = 215;
  let altoCarta = 235;
  let esp = 24;
  let inicioX = (width - (4 * anchoCarta + 3 * esp)) / 2;
  let cartaY = 135;

  for (let i = 0; i < 4; i++) {
    let p = CATALOGO_PERSONAJES[i];
    let x = inicioX + i * (anchoCarta + esp);
    let sel1 = seleccionJ1 === i;
    let sel2 = seleccionJ2 === i;

    push();
    strokeWeight(sel1 || sel2 ? 4 : 1.5);
    if (sel1 && sel2) {
      stroke(255, 230, 80);
    } else if (sel1) {
      stroke(p.color[0], p.color[1], p.color[2]);
    } else if (sel2) {
      stroke(80, 190, 255);
    } else {
      stroke(255, 255, 255, 55);
    }

    fill(20, 27, 45, 225);
    rect(x, cartaY, anchoCarta, altoCarta, 14);

    let hoja = imagenesPersonajes[p.id];
    let framesIdle = DATOS_SPRITES[p.id].idle;
    let rec = framesIdle[floor(frameCount / 10) % framesIdle.length];
    imageMode(CENTER);
    let escala = 1.35;
    image(hoja, x + anchoCarta / 2, cartaY + 95, rec[2] * escala, rec[3] * escala, rec[0], rec[1], rec[2], rec[3]);

    noStroke();
    fill(p.color[0], p.color[1], p.color[2]);
    textSize(18);
    text(p.nombre, x + anchoCarta / 2, cartaY + 168);

    fill(210);
    textSize(12);
    text("Vel: " + p.velocidad + "  |  Peso: " + p.peso, x + anchoCarta / 2, cartaY + 192);

    if (sel1) {
      fill(235, 65, 65);
      rect(x + 14, cartaY + 12, 42, 22, 6);
      fill(255);
      textSize(12);
      text("J1", x + 35, cartaY + 23);
    }
    if (sel2) {
      fill(55, 145, 255);
      rect(x + anchoCarta - 64, cartaY + 12, 50, 22, 6);
      fill(255);
      textSize(12);
      text(jugador2EsCPU ? "CPU2" : "J2", x + anchoCarta - 39, cartaY + 23);
    }
    pop();
  }

  push();
  fill(20, 27, 45, 230);
  stroke(255, 255, 255, 60);
  strokeWeight(1.5);
  rect(82, 392, width - 164, 175, 14);

  noStroke();
  fill(255, 215, 90);
  textSize(16);
  text(
    "Escenario [E]: " + esc.nombre +
      "     |     Modo [M]: " + (modoCuatroJugadores ? "4 Deportistas en Arena (Todos)" : "Duelo 1 vs 1") +
      "     |     Rival J2 [TAB]: " + (jugador2EsCPU ? "CPU" : "Humano"),
    width / 2,
    422
  );

  fill(225);
  textSize(13.5);
  text("JUGADOR 1: Mover [A / D] · Saltar [W] · Lanzar / Golpear [F] · Lanzamiento Especial [G] · Elegir [1 - 4]", width / 2, 458);
  text("JUGADOR 2: Mover [← / →] · Saltar [↑] · Lanzar / Golpear [K] · Lanzamiento Especial [L] · Elegir [7 - 0]", width / 2, 484);

  fill(170, 220, 255);
  textSize(13);
  text(
    "🔥 Fuego: Rápida, quemadura continua   |   🪨 Piedra: Masa alta, máximo knockback   |   ❄️ Nieve: Ligera, congela   |   💧 Agua: Rebota y crea charcos resbalosos",
    width / 2,
    522
  );

  let pulso = sin(frameCount * 0.1) * 35 + 220;
  fill(80, 245, 135, pulso);
  textSize(24);
  text("PRESIONA [ENTER] O [ESPACIO] PARA COMENZAR LA BATALLA", width / 2, 618);
  pop();
}

function dibujarPantallaVictoria() {
  push();
  fill(8, 12, 22, 195);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  let c = ganadorPartida ? ganadorPartida.datos.color : [255, 215, 0];
  fill(c[0], c[1], c[2]);
  textSize(50);
  text("¡VICTORIA DE " + (ganadorPartida ? ganadorPartida.controles.etiqueta : "CAMPEÓN") + "!", width / 2, height / 2 - 50);

  fill(255);
  textSize(26);
  text(ganadorPartida ? ganadorPartida.datos.nombre.toUpperCase() : "", width / 2, height / 2 + 5);

  fill(200, 220, 255);
  textSize(18);
  text("Presiona [ENTER] para revancha o [ESC] para volver al menú", width / 2, height / 2 + 65);
  pop();
}

function keyPressed() {
  if (estadoJuego === "menu") {
    if (key === "1") seleccionJ1 = 0;
    if (key === "2") seleccionJ1 = 1;
    if (key === "3") seleccionJ1 = 2;
    if (key === "4") seleccionJ1 = 3;

    if (key === "a" || key === "A") seleccionJ1 = (seleccionJ1 + 3) % 4;
    if (key === "d" || key === "D") seleccionJ1 = (seleccionJ1 + 1) % 4;

    if (keyCode === LEFT_ARROW) seleccionJ2 = (seleccionJ2 + 3) % 4;
    if (keyCode === RIGHT_ARROW) seleccionJ2 = (seleccionJ2 + 1) % 4;
    if (key === "7") seleccionJ2 = 0;
    if (key === "8") seleccionJ2 = 1;
    if (key === "9") seleccionJ2 = 2;
    if (key === "0") seleccionJ2 = 3;

    if (key === "e" || key === "E") {
      escenarioActual = (escenarioActual + 1) % LISTA_ESCENARIOS.length;
    }
    if (key === "m" || key === "M") {
      modoCuatroJugadores = !modoCuatroJugadores;
    }
    if (keyCode === TAB) {
      jugador2EsCPU = !jugador2EsCPU;
      return false;
    }
    if (keyCode === ENTER || key === " ") {
      iniciarPartida();
    }
    return;
  }

  if (estadoJuego === "jugando") {
    if (keyCode === ESCAPE) {
      estadoJuego = "menu";
      return;
    }

    for (let l of luchadores) {
      if (l.esCPU || l.vidas <= 0) continue;
      if (keyCode === l.controles.saltar) {
        l.saltar();
      }
      if (keyCode === l.controles.ataque) {
        l.ejecutarAccionAtaque(false);
      }
      if (keyCode === l.controles.especial) {
        l.ejecutarAccionAtaque(true);
      }
    }
    return;
  }

  if (estadoJuego === "fin") {
    if (keyCode === ENTER || key === " ") {
      iniciarPartida();
    } else if (keyCode === ESCAPE) {
      estadoJuego = "menu";
    }
  }
}
