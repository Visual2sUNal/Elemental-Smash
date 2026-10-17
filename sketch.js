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
let ganador = "";

let fondos = [];
let sprites = {};

const nombresFondos = ["Playa", "Rocas", "Nieve"];

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

  plataformas.push(new Plataforma(450, 520, 680, 30));
  plataformas.push(new Plataforma(250, 380, 180, 18));
  plataformas.push(new Plataforma(650, 380, 180, 18));
  plataformas.push(new Plataforma(450, 260, 200, 18));

  let controles1 = { izq: 65, der: 68, salto: 87, lanzar: 70, nombre: "Jugador 1" };
  let controles2 = { izq: LEFT_ARROW, der: RIGHT_ARROW, salto: UP_ARROW, lanzar: 75, nombre: "Jugador 2" };

  jugador1 = new Jugador(280, 200, personajes[seleccionJ1], controles1, 1);
  jugador2 = new Jugador(620, 200, personajes[seleccionJ2], controles2, -1);

  estado = "jugando";
}

function draw() {
  background(20);

  if (estado === "seleccion") {
    dibujarMenuSeleccion();
  } else if (estado === "jugando") {
    Engine.update(engine);
    dibujarJuego();
  } else if (estado === "fin") {
    dibujarPantallaFin();
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

  for (let plat of plataformas) {
    plat.mostrar();
  }

  if (frameCount % 150 === 0 && pelotas.length < 5) {
    let tipos = ["fuego", "piedra", "nieve", "agua"];
    pelotas.push(new Pelota(random(180, width - 180), -20, random(tipos)));
  }

  for (let i = pelotas.length - 1; i >= 0; i--) {
    pelotas[i].actualizar();
    pelotas[i].mostrar();
    if (pelotas[i].fueraDePantalla() || pelotas[i].usada) {
      pelotas[i].eliminar();
      pelotas.splice(i, 1);
    }
  }

  jugador1.actualizar();
  jugador1.mostrar();

  jugador2.actualizar();
  jugador2.mostrar();

  dibujarMarcador();

  if (jugador1.vidas <= 0) {
    ganador = "Jugador 2 (" + jugador2.datos.nombre + ")";
    estado = "fin";
  } else if (jugador2.vidas <= 0) {
    ganador = "Jugador 1 (" + jugador1.datos.nombre + ")";
    estado = "fin";
  }
}

function dibujarMarcador() {
  rectMode(CORNER);
  noStroke();

  fill(0, 0, 0, 160);
  rect(20, 15, 230, 65, 8);
  rect(width - 250, 15, 230, 65, 8);

  textAlign(LEFT, TOP);
  fill(255, 80, 80);
  textSize(16);
  text("J1: " + jugador1.datos.nombre, 32, 22);
  fill(255);
  text("Daño: " + jugador1.dano + "%   Vidas: " + jugador1.vidas, 32, 46);

  fill(80, 170, 255);
  text("J2: " + jugador2.datos.nombre, width - 238, 22);
  fill(255);
  text("Daño: " + jugador2.dano + "%   Vidas: " + jugador2.vidas, width - 238, 46);
}

function dibujarPantallaFin() {
  imageMode(CORNER);
  image(fondos[fondoActual], 0, 0, width, height);
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(100, 255, 120);
  textSize(42);
  text("¡VICTORIA!", width / 2, height / 2 - 40);

  fill(255);
  textSize(24);
  text("Ganador: " + ganador, width / 2, height / 2 + 10);

  textSize(18);
  text("Presiona ENTER para volver a elegir personajes", width / 2, height / 2 + 70);
}

function verificarColision(bodyA, bodyB) {
  let pelota = bodyA.pelotaRef || bodyB.pelotaRef;
  let jugador = bodyA.jugadorRef || bodyB.jugadorRef;

  if (pelota && jugador) {
    pelota.impactar(jugador);
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
    if (keyCode === jugador1.controles.salto) jugador1.saltar();
    if (keyCode === jugador1.controles.lanzar) jugador1.accionPelota();

    if (keyCode === jugador2.controles.salto) jugador2.saltar();
    if (keyCode === jugador2.controles.lanzar) jugador2.accionPelota();
    return;
  }

  if (estado === "fin" && keyCode === ENTER) {
    estado = "seleccion";
  }
}

class Plataforma {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.body = Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.08 });
    World.add(world, this.body);
  }

  mostrar() {
    push();
    rectMode(CENTER);
    stroke(40);
    strokeWeight(2);
    fill(110, 95, 80);
    rect(this.x, this.y, this.w, this.h, 6);
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

    this.vidas = 3;
    this.dano = 0;
    this.direccion = dirInicial;
    this.pelotaTomada = null;

    this.animacion = "idle";
    this.tiempoLanzar = 0;
    this.tiempoQuemado = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;
  }

  actualizar() {
    this.mover();
    this.actualizarEfectos();
    this.actualizarEstadoAnimacion();

    let pos = this.body.position;
    if (pos.y > height + 80 || pos.x < -100 || pos.x > width + 100) {
      this.perderVida();
    }
  }

  mover() {
    let factorVel = this.tiempoCongelado > 0 ? 0.45 : 1;
    let velMax = this.datos.vel * factorVel;
    let vx = this.body.velocity.x;

    if (keyIsDown(this.controles.izq)) {
      this.direccion = -1;
      vx = -velMax;
    } else if (keyIsDown(this.controles.der)) {
      this.direccion = 1;
      vx = velMax;
    } else if (this.tiempoResbaloso <= 0 && fondoActual !== 2) {
      vx *= 0.8;
    }

    Body.setVelocity(this.body, { x: vx, y: this.body.velocity.y });
  }

  saltar() {
    if (abs(this.body.velocity.y) < 1.5) {
      let fuerzaSalto = this.tiempoCongelado > 0 ? this.datos.salto * 0.7 : this.datos.salto;
      Body.setVelocity(this.body, { x: this.body.velocity.x, y: -fuerzaSalto });
    }
  }

  accionPelota() {
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
        if (d < 55) {
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
      if (this.tiempoQuemado % 40 === 0) {
        this.dano += 4;
      }
    }
    if (this.tiempoCongelado > 0) this.tiempoCongelado--;
    if (this.tiempoResbaloso > 0) this.tiempoResbaloso--;
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

  perderVida() {
    if (this.pelotaTomada) {
      this.pelotaTomada.portador = null;
      this.pelotaTomada = null;
    }
    this.vidas--;
    this.dano = 0;
    this.tiempoQuemado = 0;
    this.tiempoCongelado = 0;
    this.tiempoResbaloso = 0;

    Body.setPosition(this.body, { x: width / 2, y: 120 });
    Body.setVelocity(this.body, { x: 0, y: 0 });
  }

  mostrar() {
    let pos = this.body.position;
    let lista = cuadrosSprites[this.datos.id][this.animacion];
    let frame = lista[floor(frameCount / 8) % lista.length];

    push();
    translate(pos.x, pos.y);
    scale(this.direccion, 1);

    if (this.tiempoQuemado > 0) tint(255, 120, 80);
    else if (this.tiempoCongelado > 0) tint(130, 210, 255);
    else if (this.tiempoResbaloso > 0) tint(170, 230, 255);

    imageMode(CENTER);
    image(sprites[this.datos.id], 0, 0, frame[2], frame[3], frame[0], frame[1], frame[2], frame[3]);
    noTint();
    pop();
  }
}

class Pelota {
  constructor(x, y, tipo) {
    this.tipo = tipo;
    this.r = tipo === "piedra" ? 18 : 14;
    this.portador = null;
    this.lanzada = false;
    this.atacante = null;
    this.usada = false;

    let opciones = this.obtenerPropiedadesFisicas(tipo);
    this.body = Bodies.circle(x, y, this.r, opciones);
    this.body.pelotaRef = this;
    World.add(world, this.body);
  }

  obtenerPropiedadesFisicas(tipo) {
    if (tipo === "fuego") {
      return { restitution: 0.2, density: 0.002, frictionAir: 0.001 };
    }
    if (tipo === "piedra") {
      return { restitution: 0.1, density: 0.009, frictionAir: 0.004 };
    }
    if (tipo === "nieve") {
      return { restitution: 0.4, density: 0.0008, frictionAir: 0.015 };
    }
    return { restitution: 0.92, density: 0.0018, friction: 0.0001 };
  }

  recoger(jugador) {
    this.portador = jugador;
    this.lanzada = false;
    this.body.isSensor = true;
  }

  lanzar(jugador, dir) {
    this.portador = null;
    this.atacante = jugador;
    this.lanzada = true;
    this.body.isSensor = false;

    let velX = this.tipo === "fuego" ? 16 : (this.tipo === "piedra" ? 11 : 13);
    Body.setPosition(this.body, { x: jugador.body.position.x + dir * 32, y: jugador.body.position.y - 8 });
    Body.setVelocity(this.body, { x: dir * velX, y: -2.5 });
  }

  actualizar() {
    if (this.portador) {
      let pos = this.portador.body.position;
      Body.setPosition(this.body, { x: pos.x + this.portador.direccion * 22, y: pos.y - 5 });
      Body.setVelocity(this.body, { x: 0, y: 0 });
    } else if (this.lanzada && abs(this.body.velocity.x) < 1.2 && abs(this.body.velocity.y) < 1.2) {
      this.lanzada = false;
    }
  }

  impactar(jugador) {
    if (!this.lanzada || jugador === this.atacante) return;

    let dir = this.body.velocity.x >= 0 ? 1 : -1;
    let escala = 1 + jugador.dano / 80;

    if (this.tipo === "fuego") {
      jugador.dano += 12;
      jugador.tiempoQuemado = 160;
      Body.applyForce(jugador.body, jugador.body.position, { x: dir * 0.035 * escala, y: -0.02 });
    } else if (this.tipo === "piedra") {
      jugador.dano += 22;
      Body.applyForce(jugador.body, jugador.body.position, { x: dir * 0.085 * escala, y: -0.05 });
    } else if (this.tipo === "nieve") {
      jugador.dano += 10;
      jugador.tiempoCongelado = 180;
      Body.applyForce(jugador.body, jugador.body.position, { x: dir * 0.025 * escala, y: -0.015 });
    } else if (this.tipo === "agua") {
      jugador.dano += 10;
      jugador.tiempoResbaloso = 200;
      Body.setVelocity(jugador.body, { x: dir * 11 * escala, y: -4 });
    }

    this.usada = true;
  }

  mostrar() {
    let pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    noStroke();

    if (this.tipo === "fuego") fill(255, 90, 20);
    else if (this.tipo === "piedra") fill(130, 120, 110);
    else if (this.tipo === "nieve") fill(180, 235, 255);
    else fill(30, 145, 255);

    ellipse(0, 0, this.r * 2);
    pop();
  }

  fueraDePantalla() {
    let pos = this.body.position;
    return pos.y > height + 100 || pos.x < -100 || pos.x > width + 100;
  }

  eliminar() {
    World.remove(world, this.body);
  }
}
