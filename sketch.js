const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;

let engine;
let world;

let estado = "seleccion";
let fondoActual = 0;
let seleccionJ1 = 0;
let seleccionJ2 = 1;

let jugador1;
let jugador2;
let plataformas = [];
let pelotas = [];
let charcos = [];
let particulasPolvo = [];
let tiempoInicioPartida = 0;

let fondos = [];
let sprites = {};

const nombresFondos = ["Playa", "Rocas", "Nieve"];
const tiposPeligro = ["coco", "rocaEscenario", "bolaNieve"];
const danoImpactoArea = 5;
const radioImpactoArea = 90;
const plataformasPorEscenario = [
  [
    { x: 450, y: 520, w: 680, h: 30, estilo: "arena", fragil: true, principal: true },
    { x: 180, y: 300, w: 175, h: 22, estilo: "madera", movil: true, eje: "y", amplitud: 130, velocidad: 0.018 },
    { x: 450, y: 315, w: 175, h: 22, estilo: "madera", movil: true, eje: "x", amplitud: 55, velocidad: 0.018 },
    { x: 720, y: 290, w: 175, h: 22, estilo: "madera", movil: true, eje: "y", amplitud: 140, velocidad: 0.026 }
  ],
  [
    { x: 450, y: 520, w: 680, h: 30, estilo: "roca", principal: true },
    { x: 250, y: 405, w: 155, h: 24, estilo: "roca" },
    { x: 650, y: 405, w: 155, h: 24, estilo: "roca" },
    {
      x: 760,
      y: 120,
      w: 145,
      h: 22,
      estilo: "roca",
      movil: true,
      trayectoria: [
        [760, 120],
        [140, 120],
        [140, 470],
        [760, 470]
      ],
      velocidadTrayectoria: 2.2
    },
    { x: 450, y: 170, w: 215, h: 22, estilo: "roca" }
  ],
  [
    { x: 450, y: 520, w: 680, h: 30, estilo: "hielo", principal: true, resistencia: 25 },
    { x: 170, y: 400, w: 160, h: 22, estilo: "hielo", resistencia: 8 },
    { x: 390, y: 315, w: 150, h: 22, estilo: "hielo", movil: true, eje: "x", amplitud: 70, velocidad: 0.02, resistencia: 6 },
    { x: 680, y: 400, w: 160, h: 22, estilo: "hielo", resistencia: 8 },
    { x: 535, y: 215, w: 155, h: 22, estilo: "hielo", movil: true, eje: "x", amplitud: 150, velocidad: 0.012, resistencia: 5 }
  ]
];

const personajes = [
  { id: "beisbol", nombre: "Beisbolista", vel: 4.5, salto: 11, peso: 1.0 },
  { id: "americano", nombre: "Americano", vel: 4.0, salto: 10.5, peso: 1.3 },
  { id: "soccer", nombre: "Futbolista", vel: 5.2, salto: 11.5, peso: 0.9 },
  { id: "tenista", nombre: "Tenista", vel: 4.8, salto: 11, peso: 0.95 }
];

const cuadrosSprites = {
  beisbol: {
    idle: [[11, 21, 45, 84], [71, 21, 43, 84], [129, 22, 46, 83], [191, 21, 43, 84]],
    run: [[276, 27, 54, 78], [334, 27, 53, 77], [391, 27, 53, 78], [447, 27, 55, 78], [505, 27, 49, 78], [559, 27, 51, 78], [614, 27, 55, 78]],
    jump: [[25, 180, 39, 77], [89, 134, 51, 93], [157, 144, 42, 89], [211, 189, 41, 70]],
    throw: [[296, 170, 52, 89], [360, 178, 59, 82], [433, 178, 70, 82], [515, 181, 74, 80], [612, 178, 45, 84]]
  },
  americano: {
    idle: [[19, 20, 57, 72], [101, 20, 58, 72], [182, 18, 61, 74], [267, 19, 57, 73]],
    run: [[19, 110, 61, 73], [101, 110, 60, 73], [182, 110, 61, 72], [264, 110, 63, 72], [348, 110, 60, 73], [441, 112, 45, 71], [513, 94, 71, 82], [598, 113, 56, 70]],
    jump: [[24, 211, 54, 65], [98, 200, 69, 72], [188, 196, 49, 80]],
    throw: [[344, 201, 64, 75], [422, 201, 76, 75], [510, 201, 77, 74], [597, 200, 64, 75]]
  },
  soccer: {
    idle: [[84, 7, 27, 67], [137, 6, 27, 68], [190, 6, 28, 68], [245, 6, 27, 68], [298, 6, 28, 68], [351, 6, 27, 68]],
    run: [[74, 81, 43, 65], [128, 81, 43, 63], [183, 81, 39, 65], [234, 81, 47, 63], [287, 80, 45, 61], [343, 81, 38, 64], [395, 80, 45, 66], [450, 80, 40, 66], [502, 81, 44, 63], [556, 81, 47, 64]],
    jump: [[87, 167, 30, 53], [140, 164, 30, 56], [191, 152, 31, 64], [242, 148, 29, 55], [295, 149, 33, 54], [351, 161, 29, 59]],
    throw: [[78, 225, 59, 67], [144, 224, 48, 68], [210, 223, 51, 68], [276, 223, 60, 69], [346, 224, 52, 68], [411, 224, 56, 68], [474, 224, 60, 68], [539, 223, 63, 69]]
  },
  tenista: {
    idle: [[15, 12, 49, 60], [83, 12, 49, 60], [150, 12, 49, 61], [217, 12, 50, 61], [285, 12, 49, 61], [352, 12, 49, 61]],
    run: [[13, 86, 52, 59], [73, 86, 60, 59], [156, 85, 46, 60], [210, 85, 50, 60], [274, 85, 63, 60], [344, 86, 59, 59], [409, 85, 62, 60], [476, 85, 63, 60]],
    jump: [[15, 160, 49, 61], [86, 158, 44, 62], [149, 150, 49, 63], [210, 150, 53, 60], [283, 159, 41, 62], [358, 165, 31, 56]],
    throw: [[13, 232, 54, 61], [79, 232, 55, 61], [145, 232, 57, 61], [211, 232, 58, 61], [275, 231, 61, 62], [347, 227, 58, 66], [412, 229, 60, 64], [479, 229, 60, 64]]
  }
};

function preload() {
  fondos[0] = loadImage("sprites y fondo/fondo/playa.jpg");
  fondos[1] = loadImage("sprites y fondo/fondo/rocas.jpg");
  fondos[2] = loadImage("sprites y fondo/fondo/nievo.jpg");

  sprites.beisbol = loadImage("sprites y fondo/sprite personajes/beisboll.png");
  sprites.americano = loadImage("sprites y fondo/sprite personajes/fotball americano.png");
  sprites.soccer = loadImage("sprites y fondo/sprite personajes/futball socceer.png");
  sprites.tenista = loadImage("sprites y fondo/sprite personajes/tenista.png");
}

function setup() {
  createCanvas(900, 600);
  engine = Engine.create();
  world = engine.world;

  Events.on(engine, "collisionStart", function(event) {
    for (let pair of event.pairs) {
      verificarColision(pair.bodyA, pair.bodyB);
    }
  });
}

function iniciarJuego() {
  World.clear(world, false);
  plataformas = [];
  pelotas = [];
  charcos = [];
  particulasPolvo = [];
  tiempoInicioPartida = frameCount;

  for (let datosPlataforma of plataformasPorEscenario[fondoActual]) {
    plataformas.push(new Plataforma(datosPlataforma));
  }

  let controles1 = { izq: 65, der: 68, salto: 87, lanzar: 70, nombre: "J1" };
  let controles2 = { izq: LEFT_ARROW, der: RIGHT_ARROW, salto: UP_ARROW, lanzar: 75, nombre: "J2" };

  jugador1 = new Jugador(280, 200, personajes[seleccionJ1], controles1, 1);
  jugador2 = new Jugador(620, 200, personajes[seleccionJ2], controles2, -1);

  pelotas.push(new Pelota(340, 40, "fuego"));
  pelotas.push(new Pelota(560, 40, "piedra"));

  estado = "jugando";
}

function draw() {
  background(20);

  if (estado === "seleccion") {
    dibujarMenuSeleccion();
  } else if (estado === "jugando") {
    for (let plat of plataformas) plat.actualizar();
    Engine.update(engine);
    dibujarJuego();
  }
}

function dibujarMenuSeleccion() {
  imageMode(CORNER);
  image(fondos[fondoActual], 0, 0, width, height);
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(255, 210, 50);
  textSize(40);
  text("ELEMENTAL SMASH", width / 2, 55);

  fill(255);
  textSize(18);
  text("Escenario (Tecla E): " + nombresFondos[fondoActual], width / 2, 105);

  for (let i = 0; i < personajes.length; i++) {
    let p = personajes[i];
    let x = 135 + i * 210;
    let y = 260;

    strokeWeight(3);
    if (seleccionJ1 === i && seleccionJ2 === i) {
      stroke(255, 220, 0);
    } else if (seleccionJ1 === i) {
      stroke(255, 60, 60);
    } else if (seleccionJ2 === i) {
      stroke(60, 150, 255);
    } else {
      stroke(120);
    }

    fill(30, 35, 50, 220);
    rectMode(CENTER);
    rect(x, y, 175, 210, 10);

    let frame = cuadrosSprites[p.id].idle[floor(frameCount / 12) % cuadrosSprites[p.id].idle.length];
    imageMode(CENTER);
    image(sprites[p.id], x, y - 15, frame[2] * 1.3, frame[3] * 1.3, frame[0], frame[1], frame[2], frame[3]);

    noStroke();
    fill(255);
    textSize(16);
    text(p.nombre, x, y + 70);

    if (seleccionJ1 === i) {
      fill(255, 60, 60);
      text("J1", x - 50, y - 80);
    }
    if (seleccionJ2 === i) {
      fill(60, 150, 255);
      text("J2", x + 50, y - 80);
    }
  }

  rectMode(CORNER);
  fill(255);
  textSize(15);
  text("J1 elige con A / D  |  Mover: A, D, W  |  Recoger / Lanzar: F", width / 2, 430);
  text("J2 elige con ← / →  |  Mover: ←, →, ↑  |  Recoger / Lanzar: K", width / 2, 460);

  fill(100, 255, 140);
  textSize(22);
  text("Presiona ENTER para pelear (1 vs 1)", width / 2, 530);
}

function dibujarJuego() {
  imageMode(CORNER);
  image(fondos[fondoActual], 0, 0, width, height);
  actualizarParticulasPolvo();

  for (let plat of plataformas) {
    plat.mostrar();
  }

  for (let i = charcos.length - 1; i >= 0; i--) {
    charcos[i].vida--;
    charcos[i].mostrar();
    if (charcos[i].vida <= 0) {
      charcos.splice(i, 1);
    }
  }

  if (frameCount % 120 === 0 && pelotas.length < 6) {
    let tipos = ["fuego", "piedra", "nieve", "agua"];
    pelotas.push(new Pelota(random(180, width - 180), -20, random(tipos)));
  }

  if (frameCount - tiempoInicioPartida > 360 &&
      frameCount % 150 === 0 &&
      pelotas.length < 8) {
    pelotas.push(new Pelota(random(100, width - 100), -30, tiposPeligro[fondoActual], true));
  }

  for (let i = pelotas.length - 1; i >= 0; i--) {
    pelotas[i].actualizar();
    pelotas[i].mostrar();
    if (pelotas[i].fueraDePantalla() || pelotas[i].usada || pelotas[i].expirada()) {
      pelotas[i].eliminar();
      pelotas.splice(i, 1);
    }
  }

  jugador1.actualizar();
  jugador1.mostrar();

  jugador2.actualizar();
  jugador2.mostrar();
}

function verificarColision(bodyA, bodyB) {
  let pelota = bodyA.pelotaRef || bodyB.pelotaRef;
  let jugador = bodyA.jugadorRef || bodyB.jugadorRef;
  let plataforma = bodyA.plataformaRef || bodyB.plataformaRef;

  if (pelota && jugador) {
    pelota.impactar(jugador);
  } else if (pelota && plataforma) {
    pelota.rebotarEnPlataforma(plataforma);
  } else if (jugador && plataforma) {
    crearParticulasPolvo(plataforma.x, plataforma.y - plataforma.h / 2);
  }
}

function crearParticulasPolvo(x, y) {
  for (let i = 0; i < 12; i++) {
    particulasPolvo.push({
      x: x + random(-28, 28),
      y: y,
      vx: random(-1.5, 1.5),
      vy: random(-2.5, -0.8),
      vida: 24,
      tamano: random(2, 5),
      color: [185, 170, 145]
    });
  }
}

function crearParticulasNieve(x, y) {
  for (let i = 0; i < 18; i++) {
    particulasPolvo.push({
      x: x + random(-35, 35),
      y: y + random(-2, 5),
      vx: random(-2, 2),
      vy: random(-3, -0.8),
      vida: 32,
      tamano: random(2, 6),
      color: [225, 248, 255]
    });
  }
}

function actualizarParticulasPolvo() {
  noStroke();
  for (let i = particulasPolvo.length - 1; i >= 0; i--) {
    const particula = particulasPolvo[i];
    particula.x += particula.vx;
    particula.y += particula.vy;
    particula.vy += 0.12;
    particula.vida--;

    fill(particula.color[0], particula.color[1], particula.color[2], particula.vida * 7);
    ellipse(particula.x, particula.y, particula.tamano);

    if (particula.vida <= 0) particulasPolvo.splice(i, 1);
  }
}

function keyPressed() {
  if (estado === "seleccion") {
    if (key === "a" || key === "A") seleccionJ1 = (seleccionJ1 + 3) % 4;
    if (key === "d" || key === "D") seleccionJ1 = (seleccionJ1 + 1) % 4;
    if (keyCode === LEFT_ARROW) seleccionJ2 = (seleccionJ2 + 3) % 4;
    if (keyCode === RIGHT_ARROW) seleccionJ2 = (seleccionJ2 + 1) % 4;
    if (key === "e" || key === "E") fondoActual = (fondoActual + 1) % 3;
    if (keyCode === ENTER) iniciarJuego();
    return;
  }

  if (estado === "jugando") {
    if (keyCode === ESCAPE) {
      estado = "seleccion";
      return;
    }
    if (keyCode === jugador1.controles.salto) jugador1.saltar();
    if (keyCode === jugador1.controles.lanzar) jugador1.accionPelota();

    if (keyCode === jugador2.controles.salto) jugador2.saltar();
    if (keyCode === jugador2.controles.lanzar) jugador2.accionPelota();
  }
}

class Plataforma {
  constructor(datos) {
    this.xInicial = datos.x;
    this.yInicial = datos.y;
    this.x = datos.x;
    this.y = datos.y;
    this.w = datos.w;
    this.h = datos.h;
    this.estilo = datos.estilo;
    this.movil = datos.movil || false;
    this.eje = datos.eje || "x";
    this.amplitud = datos.amplitud || 0;
    this.velocidad = datos.velocidad || 0;
    this.trayectoria = datos.trayectoria || null;
    this.velocidadTrayectoria = datos.velocidadTrayectoria || 0;
    this.puntoTrayectoria = 0;
    this.progresoTrayectoria = 0;
    this.fragil = datos.fragil || false;
    this.principal = datos.principal || false;
    this.resistenciaMaxima = datos.resistencia || 0;
    this.resistencia = this.resistenciaMaxima;
    this.grietas = 0;
    this.mojada = false;
    this.tiempoMojada = 0;
    this.pisadas = 0;
    this.jugadoresSobre = { J1: false, J2: false };
    this.desaparecida = false;
    this.tiempoDesaparecida = 0;
    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, {
      isStatic: true,
      friction: this.estilo === "hielo" ? 0.01 : 0.08
    });
    this.body.plataformaRef = this;
    World.add(world, this.body);
  }

  actualizar() {
    if (this.desaparecida) {
      this.tiempoDesaparecida--;
      if (this.tiempoDesaparecida <= 0) this.reaparecer();
      return;
    }

    if (this.trayectoria) {
      this.actualizarTrayectoria();
    } else if (this.movil) {
      if (this.eje === "y") {
        this.y = this.yInicial + sin(frameCount * this.velocidad) * this.amplitud;
      } else {
        this.x = this.xInicial + sin(frameCount * this.velocidad) * this.amplitud;
      }
      Body.setPosition(this.body, { x: this.x, y: this.y });
    }

    if (this.mojada) this.tiempoMojada--;
    if (this.tiempoMojada <= 0) this.mojada = false;

    this.registrarPisadas();
  }

  actualizarTrayectoria() {
    const inicio = this.trayectoria[this.puntoTrayectoria];
    const siguiente = this.trayectoria[(this.puntoTrayectoria + 1) % this.trayectoria.length];
    const distancia = dist(inicio[0], inicio[1], siguiente[0], siguiente[1]);

    this.progresoTrayectoria += this.velocidadTrayectoria / distancia;
    if (this.progresoTrayectoria >= 1) {
      this.progresoTrayectoria = 0;
      this.puntoTrayectoria = (this.puntoTrayectoria + 1) % this.trayectoria.length;
    }

    this.x = lerp(inicio[0], siguiente[0], this.progresoTrayectoria);
    this.y = lerp(inicio[1], siguiente[1], this.progresoTrayectoria);
    Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  mojar() {
    this.mojada = true;
    this.tiempoMojada = 360;
  }

  registrarPisadas() {
    if ((!this.fragil && this.resistenciaMaxima <= 0) || this.desaparecida) return;

    const jugadores = [
      ["J1", jugador1],
      ["J2", jugador2]
    ];

    for (let [id, jugador] of jugadores) {
      if (!jugador) continue;

      const pies = jugador.body.position.y + jugador.h / 2;
      const sobrePlataforma =
        abs(jugador.body.position.x - this.x) <= this.w / 2 + jugador.w / 2 &&
        abs(pies - (this.y - this.h / 2)) <= 9 &&
        jugador.body.velocity.y >= -0.5;

      if (sobrePlataforma && !this.jugadoresSobre[id]) {
        if (this.resistenciaMaxima > 0) {
          this.recibirDano(1);
        } else {
          this.pisadas++;
          if (this.pisadas >= 11) {
            this.desaparecer();
            return;
          }
        }
      }
      this.jugadoresSobre[id] = sobrePlataforma;
    }
  }

  desaparecer() {
    this.desaparecida = true;
    this.tiempoDesaparecida = this.estilo === "hielo" ? 180 : 120;
    this.jugadoresSobre = { J1: false, J2: false };
    this.body.collisionFilter.mask = 0;
  }

  reaparecer() {
    this.desaparecida = false;
    this.pisadas = 0;
    this.resistencia = this.resistenciaMaxima;
    this.grietas = 0;
    this.body.collisionFilter.mask = 0xFFFFFFFF;
    Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  recibirDano(cantidad) {
    if (this.resistenciaMaxima <= 0 || this.desaparecida) return;

    this.resistencia = max(0, this.resistencia - cantidad);
    this.grietas = 1 - this.resistencia / this.resistenciaMaxima;
    crearParticulasNieve(this.x, this.y - this.h / 2);

    if (this.resistencia <= 0) this.desaparecer();
  }

  mostrar() {
    if (this.desaparecida) return;

    push();
    rectMode(CENTER);
    strokeWeight(2);

    if (this.estilo === "arena") {
      stroke(116, 78, 39);
      fill(212, 164, 76);
      rect(this.x, this.y, this.w, this.h, 12);
      stroke(244, 205, 112);
      line(this.x - this.w / 2 + 12, this.y - 5, this.x + this.w / 2 - 12, this.y - 5);
      if (this.fragil && this.pisadas >= 6) {
        stroke(116, 78, 39);
        line(this.x - 55, this.y - 5, this.x - 42, this.y + 7);
        line(this.x - 42, this.y + 7, this.x - 28, this.y - 4);
        line(this.x + 32, this.y - 5, this.x + 46, this.y + 7);
      }
    } else if (this.estilo === "madera") {
      stroke(76, 43, 25);
      fill(145, 83, 39);
      rect(this.x, this.y, this.w, this.h, 8);
      stroke(194, 124, 57);
      line(this.x - this.w / 2 + 12, this.y + 3, this.x + this.w / 2 - 12, this.y + 3);
    } else if (this.estilo === "roca") {
      stroke(48, 45, 55);
      fill(91, 88, 103);
      beginShape();
      vertex(this.x - this.w / 2, this.y + this.h / 2);
      vertex(this.x - this.w / 2 + 12, this.y - this.h / 2);
      vertex(this.x + this.w / 2 - 14, this.y - this.h / 2);
      vertex(this.x + this.w / 2, this.y + this.h / 2);
      endShape(CLOSE);
      stroke(137, 132, 151);
      line(this.x - this.w / 2 + 20, this.y - 4, this.x + this.w / 2 - 25, this.y - 4);
    } else {
      stroke(126, 201, 229);
      fill(184, 237, 250);
      rect(this.x, this.y, this.w, this.h, 7);
      stroke(245, 255, 255);
      line(this.x - this.w / 2 + 10, this.y - 4, this.x - 8, this.y + 5);
      line(this.x + 5, this.y - 6, this.x + this.w / 2 - 12, this.y + 4);
      if (this.resistenciaMaxima > 0) {
        const danoVisual = 1 - this.resistencia / this.resistenciaMaxima;
        stroke(95, 165, 195);
        for (let i = 0; i < floor(danoVisual * 5); i++) {
          const cx = this.x - this.w / 2 + 20 + i * 28;
          line(cx, this.y - 5, cx + 10, this.y + 5);
        }
      }
    }

    if (this.mojada) {
      noStroke();
      fill(45, 170, 235, 185);
      rect(this.x, this.y - this.h / 2 - 2, this.w - 8, 7, 4);
      fill(165, 230, 255, 150);
      rect(this.x - this.w * 0.22, this.y - this.h / 2 - 3, this.w * 0.22, 2, 2);
    }
    pop();
  }
}

class Charco {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 110;
    this.vida = 300;
  }

  mostrar() {
    push();
    noStroke();
    fill(40, 165, 255, 190);
    ellipse(this.x, this.y, this.w, 10);
    pop();
  }
}

class Jugador {
  constructor(x, y, datos, controles, dirInicial) {
    this.datos = datos;
    this.controles = controles;
    this.w = 36;
    this.h = 64;

    this.body = Bodies.rectangle(x, y, this.w, this.h, {
      inertia: Infinity,
      friction: 0.05,
      density: 0.002 * datos.peso
    });
    this.body.jugadorRef = this;
    World.add(world, this.body);

    this.vida = 100;
    this.dano = 0;
    this.direccion = dirInicial;
    this.pelotaTomada = null;

    this.animacion = "idle";
    this.tiempoLanzar = 0;
    this.tiempoQuemado = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;
    this.tiempoAturdido = 0;
    this.mensajeEfecto = "";
    this.tiempoMensaje = 0;
  }

  actualizar() {
    this.verificarCharco();
    this.verificarPlataformaMojada();
    this.actualizarEfectos();

    if (this.tiempoAturdido <= 0) {
      this.mover();
    }

    this.actualizarEstadoAnimacion();

    let pos = this.body.position;
    if (pos.y > height + 80 || pos.x < -120 || pos.x > width + 120) {
      this.reaparecer();
    }
  }

  verificarCharco() {
    let pos = this.body.position;
    let piesY = pos.y + this.h / 2;
    for (let c of charcos) {
      if (abs(pos.x - c.x) < c.w / 2 && abs(piesY - c.y) < 20) {
        this.tiempoResbaloso = 45;
      }
    }
  }

  verificarPlataformaMojada() {
    const piesY = this.body.position.y + this.h / 2;
    for (let plataforma of plataformas) {
      if (!plataforma.mojada) continue;

      const sobrePlataforma =
        abs(this.body.position.x - plataforma.x) <= plataforma.w / 2 + this.w / 2 &&
        abs(piesY - (plataforma.y - plataforma.h / 2)) <= 10;

      if (sobrePlataforma) this.tiempoResbaloso = 45;
    }
  }

  mover() {
    if (this.tiempoCongelado > 100) {
      Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y });
      return;
    }

    let factorVel = this.tiempoCongelado > 0 ? 0.3 : 1;
    let velMax = this.datos.vel * factorVel;
    let vx = this.body.velocity.x;

    if (this.tiempoResbaloso > 0) {
      if (keyIsDown(this.controles.izq)) {
        this.direccion = -1;
        vx = lerp(vx, -velMax * 1.4, 0.04);
      } else if (keyIsDown(this.controles.der)) {
        this.direccion = 1;
        vx = lerp(vx, velMax * 1.4, 0.04);
      } else {
        vx *= 0.985;
      }
    } else {
      if (keyIsDown(this.controles.izq)) {
        this.direccion = -1;
        vx = -velMax;
      } else if (keyIsDown(this.controles.der)) {
        this.direccion = 1;
        vx = velMax;
      } else {
        vx *= 0.75;
      }
    }

    Body.setVelocity(this.body, { x: vx, y: this.body.velocity.y });
  }

  saltar() {
    if (this.tiempoAturdido > 0 || this.tiempoCongelado > 100) return;

    if (abs(this.body.velocity.y) < 1.5) {
      let fuerzaSalto = this.tiempoCongelado > 0 ? this.datos.salto * 0.55 : this.datos.salto;
      Body.setVelocity(this.body, { x: this.body.velocity.x, y: -fuerzaSalto });
    }
  }

  accionPelota() {
    if (this.tiempoAturdido > 0 || this.tiempoCongelado > 100) return;

    if (this.pelotaTomada) {
      this.pelotaTomada.lanzar(this, this.direccion);
      this.pelotaTomada = null;
      this.tiempoLanzar = 18;
      return;
    }

    let pos = this.body.position;
    for (let p of pelotas) {
      if (!p.portador && !p.lanzada) {
        let d = dist(pos.x, pos.y, p.body.position.x, p.body.position.y);
        if (d < 60) {
          this.pelotaTomada = p;
          p.recoger(this);
          break;
        }
      }
    }
  }

  actualizarEfectos() {
    if (this.tiempoQuemado > 0) {
      this.tiempoQuemado--;
      if (this.tiempoQuemado % 30 === 0) {
        this.dano += 4;
        this.vida = max(0, this.vida - 3);
      }
    }
    if (this.tiempoCongelado > 0) this.tiempoCongelado--;
    if (this.tiempoResbaloso > 0) this.tiempoResbaloso--;
    if (this.tiempoAturdido > 0) this.tiempoAturdido--;
    if (this.tiempoMensaje > 0) this.tiempoMensaje--;
  }

  mostrarEfectoTexto(texto) {
    this.mensajeEfecto = texto;
    this.tiempoMensaje = 55;
  }

  actualizarEstadoAnimacion() {
    if (this.tiempoLanzar > 0) {
      this.tiempoLanzar--;
      this.animacion = "throw";
    } else if (abs(this.body.velocity.y) > 1.5) {
      this.animacion = "jump";
    } else if (abs(this.body.velocity.x) > 0.8) {
      this.animacion = "run";
    } else {
      this.animacion = "idle";
    }
  }

  reaparecer() {
    if (this.pelotaTomada) {
      this.pelotaTomada.portador = null;
      this.pelotaTomada.body.isSensor = false;
      this.pelotaTomada = null;
    }
    this.tiempoQuemado = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;
    this.tiempoAturdido = 0;

    Body.setPosition(this.body, { x: width / 2, y: 120 });
    Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  mostrar() {
    let pos = this.body.position;
    let lista = cuadrosSprites[this.datos.id][this.animacion];
    let frame = lista[floor(frameCount / 8) % lista.length];

    push();
    translate(pos.x, pos.y);

    push();
    scale(this.direccion, 1);
    if (this.tiempoQuemado > 0) tint(255, 100, 50);
    else if (this.tiempoCongelado > 0) tint(100, 200, 255);
    else if (this.tiempoResbaloso > 0) tint(150, 220, 255);

    imageMode(CENTER);
    image(sprites[this.datos.id], 0, 0, frame[2], frame[3], frame[0], frame[1], frame[2], frame[3]);
    noTint();
    pop();

    if (this.tiempoQuemado > 0) {
      noStroke();
      fill(255, random(80, 180), 0, 200);
      ellipse(random(-12, 12), random(-25, 10), random(8, 16));
      ellipse(random(-12, 12), random(-25, 10), random(6, 12));
    }

    if (this.tiempoCongelado > 100) {
      fill(150, 230, 255, 120);
      stroke(220, 250, 255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(0, 0, this.w + 12, this.h + 8, 6);
    }

    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(13);
    fill(255);
    text(this.controles.nombre, 0, -40);

    if (this.tiempoMensaje > 0) {
      fill(255, 230, 60);
      textSize(14);
      text(this.mensajeEfecto, 0, -56);
    }
    pop();
  }
}

class Pelota {
  constructor(x, y, tipo, peligroEscenario = false) {
    this.tipo = tipo;
    this.peligroEscenario = peligroEscenario;
    this.r = tipo === "piedra" || tipo === "rocaEscenario" ? 21 :
      (tipo === "nieve" || tipo === "bolaNieve" ? 13 : 15);
    this.portador = null;
    this.lanzada = peligroEscenario;
    this.atacante = null;
    this.usada = false;
    this.rebotes = 0;
    this.tiempoRestante = -1;
    this.plataformaApoyada = null;
    this.offsetPlataforma = { x: 0, y: 0 };

    let opciones = this.obtenerPropiedadesFisicas(tipo);
    this.body = Bodies.circle(x, y, this.r, opciones);
    this.body.pelotaRef = this;
    World.add(world, this.body);
  }

  obtenerPropiedadesFisicas(tipo) {
    if (tipo === "fuego") {
      return { restitution: 0.2, density: 0.002, frictionAir: 0.0005 };
    }
    if (tipo === "piedra") {
      return { restitution: 0.08, density: 0.012, frictionAir: 0.003 };
    }
    if (tipo === "nieve") {
      return { restitution: 0.35, density: 0.0006, frictionAir: 0.022 };
    }
    if (tipo === "coco") {
      return { restitution: 0.25, density: 0.004, frictionAir: 0.003 };
    }
    if (tipo === "rocaEscenario") {
      return { restitution: 0.1, density: 0.012, frictionAir: 0.003 };
    }
    if (tipo === "bolaNieve") {
      return { restitution: 0.3, density: 0.001, frictionAir: 0.018 };
    }
    return { restitution: 0.95, density: 0.002, friction: 0.0001 };
  }

  recoger(jugador) {
    this.portador = jugador;
    this.plataformaApoyada = null;
    this.lanzada = false;
    this.body.isSensor = true;
  }

  lanzar(jugador, dir) {
    this.portador = null;
    this.plataformaApoyada = null;
    this.atacante = jugador;
    this.lanzada = true;
    this.rebotes = 0;
    this.body.isSensor = false;

    let velX = 13;
    let velY = -2.5;

    if (this.tipo === "fuego") {
      velX = 19;
      velY = -1.2;
    } else if (this.tipo === "piedra") {
      velX = 11.5;
      velY = -4.2;
    } else if (this.tipo === "nieve") {
      velX = 12;
      velY = -2.0;
    } else if (this.tipo === "agua") {
      velX = 14.5;
      velY = -5.5;
    }

    Body.setPosition(this.body, { x: jugador.body.position.x + dir * 34, y: jugador.body.position.y - 8 });
    Body.setVelocity(this.body, { x: dir * velX, y: velY });
  }

  rebotarEnPlataforma(plataforma) {
    if (this.portador) return;

    if (this.peligroEscenario && this.tiempoRestante < 0) {
      this.lanzada = false;
      this.tiempoRestante = 300;
      crearParticulasPolvo(this.body.position.x, plataforma.y - plataforma.h / 2);
      if (this.tipo === "bolaNieve") plataforma.recibirDano(2);
      this.aplicarImpactoArea();
      return;
    }

    if (this.tipo === "agua" && !plataforma.principal && (this.lanzada || abs(this.body.velocity.y) > 4)) {
      plataforma.mojar();
      this.usada = true;
      return;
    }

    if (this.tipo === "agua" && (this.lanzada || abs(this.body.velocity.y) > 4)) {
      let px = constrain(this.body.position.x, plataforma.x - plataforma.w / 2 + 40, plataforma.x + plataforma.w / 2 - 40);
      charcos.push(new Charco(px, plataforma.y - plataforma.h / 2));
      this.lanzada = false;
      this.rebotes = 0;
      this.apoyarEnPlataforma(plataforma);
      return;
    }

    if (this.lanzada) {
      this.rebotes++;
      let maxRebotes = this.tipo === "agua" ? 4 : 2;
      if (this.rebotes >= maxRebotes) {
        this.lanzada = false;
      }
    }

  }

  actualizar() {
    if (this.tiempoRestante >= 0) this.tiempoRestante--;

    if (this.portador) {
      let pos = this.portador.body.position;
      Body.setPosition(this.body, { x: pos.x + this.portador.direccion * 22, y: pos.y - 5 });
      Body.setVelocity(this.body, { x: 0, y: 0 });
    } else if (this.plataformaApoyada) {
      if (this.plataformaApoyada.desaparecida) {
        this.plataformaApoyada = null;
        this.body.isSensor = false;
      } else {
        Body.setPosition(this.body, {
          x: this.plataformaApoyada.x + this.offsetPlataforma.x,
          y: this.plataformaApoyada.y + this.offsetPlataforma.y
        });
        Body.setVelocity(this.body, { x: 0, y: 0 });
      }
    } else if (this.lanzada && abs(this.body.velocity.x) < 1.0 && abs(this.body.velocity.y) < 1.0) {
      this.lanzada = false;
    }
  }

  apoyarEnPlataforma(plataforma) {
    this.plataformaApoyada = plataforma;
    this.offsetPlataforma = {
      x: constrain(this.body.position.x, plataforma.x - plataforma.w / 2 + this.r, plataforma.x + plataforma.w / 2 - this.r) - plataforma.x,
      y: -plataforma.h / 2 - this.r
    };
    this.body.isSensor = true;
    Body.setPosition(this.body, {
      x: plataforma.x + this.offsetPlataforma.x,
      y: plataforma.y + this.offsetPlataforma.y
    });
    Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  aplicarImpactoArea() {
    const jugadores = [jugador1, jugador2];
    for (let jugador of jugadores) {
      if (!jugador) continue;

      const distancia = dist(
        this.body.position.x,
        this.body.position.y,
        jugador.body.position.x,
        jugador.body.position.y
      );

      if (distancia <= radioImpactoArea) {
        jugador.vida = max(0, jugador.vida - danoImpactoArea);
        jugador.dano += danoImpactoArea;
        jugador.mostrarEfectoTexto(`¡IMPACTO DE ${this.tipo.toUpperCase()}! -${danoImpactoArea}`);
        Body.setVelocity(jugador.body, { x: 0, y: -4 });
      }
    }
  }

  impactar(jugador) {
    if (!this.lanzada || jugador === this.atacante) return;

    if (this.peligroEscenario) {
      jugador.vida = max(0, jugador.vida - 10);
      jugador.dano += 10;
      jugador.mostrarEfectoTexto("¡OBJETO DEL ESCENARIO! -10");
      Body.setVelocity(jugador.body, { x: this.body.velocity.x >= 0 ? 7 : -7, y: -5 });
      this.usada = true;
      return;
    }

    let dir = this.body.velocity.x >= 0 ? 1 : -1;
    let escala = 1 + jugador.dano / 70;

    if (this.tipo === "fuego") {
      jugador.vida = max(0, jugador.vida - 14);
      jugador.dano += 14;
      jugador.tiempoQuemado = 210;
      jugador.mostrarEfectoTexto("🔥 ¡QUEMADURA! -14");
      Body.setVelocity(jugador.body, { x: dir * 6, y: -4 });
      this.usada = true;
    } else if (this.tipo === "piedra") {
      jugador.vida = max(0, jugador.vida - 28);
      jugador.dano += 28;
      jugador.tiempoAturdido = 32;
      jugador.mostrarEfectoTexto("🪨 ¡SUPER KNOCKBACK! -28");
      Body.setVelocity(jugador.body, { x: dir * 16 * escala, y: -10.5 });
      this.usada = true;
    } else if (this.tipo === "nieve") {
      jugador.vida = max(0, jugador.vida - 8);
      jugador.dano += 8;
      jugador.tiempoCongelado = 190;
      jugador.mostrarEfectoTexto("❄️ ¡CONGELADO! -8");
      Body.setVelocity(jugador.body, { x: dir * 2.5, y: -2 });
      this.usada = true;
    } else if (this.tipo === "agua") {
      jugador.vida = max(0, jugador.vida - 10);
      jugador.dano += 10;
      jugador.tiempoResbaloso = 220;
      jugador.mostrarEfectoTexto("💧 ¡EMPUJÓN Y RESBALÓN! -10");
      charcos.push(new Charco(jugador.body.position.x, jugador.body.position.y + 30));
      Body.setVelocity(jugador.body, { x: dir * 12.5 * escala, y: -5 });
      Body.setVelocity(this.body, { x: -this.body.velocity.x * 0.85, y: -7 });
      this.rebotes++;
      if (this.rebotes >= 3) this.usada = true;
    }
  }

  mostrar() {
    let pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    rotate(this.body.angle);

    if (this.tipo === "fuego") {
      noStroke();
      fill(255, 180, 0, 140);
      ellipse(-this.body.velocity.x * 0.6, -this.body.velocity.y * 0.6, this.r * 2.3);
      fill(255, 70, 15);
      ellipse(0, 0, this.r * 2);
      fill(255, 220, 60);
      ellipse(-3, -3, this.r);
    } else if (this.tipo === "piedra") {
      stroke(55, 50, 45);
      strokeWeight(2);
      fill(125, 115, 105);
      ellipse(0, 0, this.r * 2);
      line(-8, -5, 5, 7);
      line(6, -7, -4, 6);
    } else if (this.tipo === "nieve") {
      stroke(255);
      strokeWeight(1.5);
      fill(175, 235, 255);
      ellipse(0, 0, this.r * 2);
      line(-6, 0, 6, 0);
      line(0, -6, 0, 6);
    } else if (this.tipo === "coco") {
      stroke(55, 35, 20);
      strokeWeight(2);
      fill(105, 65, 30);
      ellipse(0, 0, this.r * 2);
      noStroke();
      fill(45, 25, 15);
      ellipse(-5, -5, 4, 4);
      ellipse(3, -6, 4, 4);
      ellipse(0, 2, 4, 4);
    } else if (this.tipo === "rocaEscenario") {
      stroke(45, 40, 35);
      strokeWeight(2);
      fill(90, 85, 80);
      beginShape();
      vertex(-this.r, 5);
      vertex(-this.r * 0.6, -this.r);
      vertex(this.r * 0.6, -this.r * 0.8);
      vertex(this.r, 5);
      vertex(0, this.r);
      endShape(CLOSE);
    } else if (this.tipo === "bolaNieve") {
      stroke(255);
      strokeWeight(1.5);
      fill(220, 245, 255);
      ellipse(0, 0, this.r * 2);
      line(-6, 0, 6, 0);
      line(0, -6, 0, 6);
    } else {
      noStroke();
      fill(25, 145, 255);
      ellipse(0, 0, this.r * 2);
      fill(170, 230, 255);
      ellipse(-4, -4, this.r * 0.8);
    }
    pop();
  }

  fueraDePantalla() {
    let pos = this.body.position;
    return pos.y > height + 100 || pos.x < -100 || pos.x > width + 100;
  }

  expirada() {
    return this.tiempoRestante === 0;
  }

  eliminar() {
    World.remove(world, this.body);
  }
}
