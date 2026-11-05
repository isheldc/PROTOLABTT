/* ==========================================================================
   NEXORA LAB - SISTEMA CIENTÍFICO INTEGRAL Y SIMULADORES INTERACTIVOS
   ========================================================================== */

const $ = (id) => document.getElementById(id);

// --- ESTADO GENERAL DE LA APLICACIÓN ---
let student = localStorage.getItem("nexoraStudent") || "";
let experiments = Number(localStorage.getItem("nexoraExperiments") || 0);
let correctAnswers = Number(localStorage.getItem("nexoraCorrect") || 0);
let history = JSON.parse(localStorage.getItem("nexoraHistory") || "[]");

// --- ESTADO PARA LAS MISIONES DE 7 PASOS ---
let nivelActual = "Secundaria";
let materiaActual = "Fisica";
let expActual = null;
let pasoActual = 1;
let animId = null;
let sensorActivo = false;
let sensorTilt = 0;

let userSession = {
    observacionSeleccionada: "",
    observacionLibre: "",
    problemaSeleccionado: "",
    hipotesisCondicion: "",
    hipotesisEfecto: "",
    ensayos: [],
    analisisSeleccionado: "",
    conclusionSeleccionada: "",
    conclusionTexto: "",
    comunicacionTitular: ""
};

let simVars = { param1: 35, fuerza: 14, masa: 2.0 };
let circuitoEstado = { bateria: false, cable: false, foco: false };

// ==========================================
// BASE DE DATOS DE 18 EXPERIMENTOS COMPLETOS
// (3 POR MATERIA / NIVEL: SECUNDARIA Y PREPARATORIA)
// ==========================================
const dbExperimentos = {
    Secundaria: {
        Fisica: [
            {
                id: "s-fis-1",
                titulo: "Fuerza y Fricción (2ª Ley de Newton)",
                desc: "Descubre cómo un objeto acelera cuando empujas más fuerte o cuando el suelo resbala más.",
                simTipo: "fuerza",
                preguntasObs: [
                    "El carrito acelera rápido cuando se aplica fuerza, pero frena por la fricción.",
                    "El carrito nunca se mueve sin importar cuánta fuerza apliquemos.",
                    "La fricción aumenta la velocidad del carrito hacia adelante."
                ],
                preguntasProb: [
                    "¿Cómo influye la fuerza del empuje en la aceleración del carrito?",
                    "¿De qué color debe ser el carrito para que no tenga fricción?",
                    "¿Por qué los objetos pesan más en la noche?"
                ],
                hipCondiciones: ["Aumentamos la fuerza de empuje", "Ponemos hielo (cero fricción)", "Aumentamos el peso al doble"],
                hipEfectos: ["el carrito acelera más rápido", "el carrito tardará más en moverse", "la aceleración se mantendrá igual"],
                analisisOpciones: [
                    "A mayor fuerza aplicada, la aceleración aumenta de forma proporcional.",
                    "La fuerza no tiene ninguna relación con la velocidad del objeto.",
                    "El peso no afecta en absoluto la aceleración."
                ],
                conclusionesOpciones: [
                    "Se confirma la hipótesis: La fuerza neta es directamente proporcional a la aceleración (F = m·a).",
                    "Se refuta la hipótesis: Los objetos pesados siempre van más rápido por gravedad.",
                    "No se obtuvieron suficientes datos numéricos para decidir."
                ],
                titularesCom: [
                    "⚡ ¡Comprobado!: Más fuerza equivale a mayor aceleración en carritos de prueba.",
                    "🚗 El misterio del auto que nunca frenó.",
                    "🔬 Científicos demuestran que la fricción frena los cuerpos en movimiento."
                ]
            },
            {
                id: "s-fis-2",
                titulo: "Conservación de Energía en el Péndulo",
                desc: "¿Puede un péndulo ganar energía de la nada? Analiza energía cinética vs potencial.",
                simTipo: "pendulo",
                preguntasObs: [
                    "Al soltar la esfera desde lo alto, gana velocidad al caer y la pierde al subir.",
                    "La esfera sube más alto de la altura desde donde fue soltada.",
                    "El péndulo se queda quieto en el aire sin caer."
                ],
                preguntasProb: [
                    "¿Se conserva la energía mecánica total al oscilar un péndulo sin aire?",
                    "¿Por qué el hilo del péndulo cambia de color con el calor?",
                    "¿Cómo influye el día de la semana en las oscilaciones?"
                ],
                hipCondiciones: ["Soltamos la esfera desde una altura mayor", "Cambiamos el material de la esfera por madera", "Eliminamos toda resistencia del aire"],
                hipEfectos: ["alcanzará mayor velocidad máxima en el punto más bajo", "el péndulo flotará hacia el techo", "se detendrá instantáneamente"],
                analisisOpciones: [
                    "La energía potencial en lo alto se transforma en cinética al caer, sumando siempre un total constante.",
                    "La energía se destruye por completo cada vez que la esfera pasa por el centro.",
                    "El péndulo acumula energía infinita en cada oscilación."
                ],
                conclusionesOpciones: [
                    "Se valida: La energía mecánica se transforma continuamente pero no se crea ni se destruye.",
                    "Se refuta: La energía desaparece totalmente sin transformarse en nada.",
                    "Inconcluso: Se requiere medir con cronómetro manual."
                ],
                titularesCom: [
                    "⚖️ De potencial a cinética: La danza eterna de la energía del péndulo.",
                    "🔮 Bolas oscilantes desafían las leyes del universo.",
                    "🎯 Reporte escolar demuestra la conservación de la energía mecánica."
                ]
            },
            {
                id: "s-fis-3",
                titulo: "Circuitos Eléctricos y Ley de Ohm",
                desc: "¿Qué pasa con la corriente de un foco si aumentas el voltaje o la resistencia?",
                simTipo: "circuito",
                preguntasObs: [
                    "El foco brilla con más intensidad cuando aumentamos el voltaje de la batería.",
                    "Al aumentar la resistencia del cable, el foco se ilumina con mayor brillo.",
                    "Los electrones no fluyen cuando el interruptor está cerrado."
                ],
                preguntasProb: [
                    "¿Cómo afecta el aumento de resistencia al flujo de corriente (Amperes)?",
                    "¿De qué forma la batería genera calor sin tocar nada?",
                    "¿Por qué los focos sólo sirven en la oscuridad?"
                ],
                hipCondiciones: ["Aumentamos el voltaje de la batería", "Colocamos una resistencia muy alta", "Conectamos dos focos en serie"],
                hipEfectos: ["la corriente aumentará y el foco brillará más", "la corriente disminuirá y el brillo bajará", "el circuito dejará de conducir por completo"],
                analisisOpciones: [
                    "La corriente es directamente proporcional al voltaje e inversamente proporcional a la resistencia (I = V/R).",
                    "A mayor resistencia, más corriente pasa por el circuito.",
                    "El voltaje nunca afecta la intensidad lumínica."
                ],
                conclusionesOpciones: [
                    "Hipótesis respaldada: La Ley de Ohm gobierna con exactitud el brillo del circuito virtual.",
                    "Hipótesis refutada: El foco brilló menos al subir el voltaje.",
                    "Faltan pruebas para determinar el valor de los Ohms."
                ],
                titularesCom: [
                    "💡 Hackeando la electricidad: La Ley de Ohm explicada con luz virtual.",
                    "⚡ Baterías al límite en el laboratorio digital.",
                    "🔌 Estudiantes comprueban cómo la resistencia frena la corriente."
                ]
            }
        ],
        Quimica: [
            {
                id: "s-qui-1",
                titulo: "Escala de pH: Ácidos, Neutros y Bases",
                desc: "¿Por qué el limón arde y el jabón resbala? Mide el pH y neutraliza soluciones.",
                simTipo: "ph",
                preguntasObs: [
                    "El líquido cambia a rojo con ácidos y a violeta/azul con sustancias básicas.",
                    "El pH siempre se mantiene en 7 sin importar qué sustancia agreguemos.",
                    "Los ácidos y las bases son exactamente la misma sustancia química."
                ],
                preguntasProb: [
                    "¿Qué ocurre con el pH de un ácido cuando agregamos una base en igual proporción?",
                    "¿Por qué los ácidos tienen sabor dulce en la simulación?",
                    "¿Cómo cambia el color del agua si no le agregamos ningún reactivo?"
                ],
                hipCondiciones: ["Añadimos gotas de base (NaOH) a un ácido fuerte", "Agregamos agua pura al compuesto", "Mezclamos dos ácidos idénticos"],
                hipEfectos: ["el pH subirá hacia 7 (neutralización)", "el pH caerá a valores negativos", "la solución explotará instantáneamente"],
                analisisOpciones: [
                    "La adición de iones OH- neutraliza los iones H+, llevando el pH hacia la zona neutra (7).",
                    "El pH se mantiene estático sin importar la cantidad de gotas.",
                    "Las bases vuelven a las sustancias más ácidas."
                ],
                conclusionesOpciones: [
                    "Se confirma: La neutralización química equilibra el pH entre ácidos y bases.",
                    "Se refuta: Los reactivos no cambiaron de color ni de pH.",
                    "El indicador universal no responde a reactivos."
                ],
                titularesCom: [
                    "🧪 El arcoíris del pH: Logramos la neutralización química perfecta.",
                    "🍋 Del jugo de limón al jabón: ¿Qué tan peligroso es el pH?",
                    "⚗️ Reporte químico: Neutralizando soluciones ácidas en el laboratorio."
                ]
            },
            {
                id: "s-qui-2",
                titulo: "Calor y Estados de la Materia",
                desc: "Aplica calor a cubos de hielo virtuales y observa cómo las moléculas se separan.",
                simTipo: "termico",
                preguntasObs: [
                    "Al calentar, las partículas vibran con mayor velocidad y se separan (sólido a líquido a gas).",
                    "Al aplicar calor las partículas se congelan y quedan inmóviles.",
                    "Las moléculas desaparecen del frasco cuando hierve el agua."
                ],
                preguntasProb: [
                    "¿Cómo influye la temperatura en la energía cinética de las moléculas de agua?",
                    "¿Por qué el fuego hace que los átomos pesen menos?",
                    "¿A qué temperatura el agua se convierte en oro?"
                ],
                hipCondiciones: ["Suministramos calor continuo al recipiente", "Enfriamos el sistema a cero absoluto", "Mantenemos la temperatura constante"],
                hipEfectos: ["las partículas pasarán de estado sólido a líquido y gas", "las partículas formarán un cristal gigante", "las partículas se destruirán"],
                analisisOpciones: [
                    "La temperatura es una medida de la energía cinética promedio de las moléculas.",
                    "El calor elimina el movimiento molecular por completo.",
                    "Los gases tienen partículas más juntas que los sólidos."
                ],
                conclusionesOpciones: [
                    "Se valida: Los cambios de estado físico dependen de la energía térmica suministrada.",
                    "Se rechaza: El hielo no cambió de forma con la temperatura.",
                    "Datos insuficientes sobre el punto de ebullición."
                ],
                titularesCom: [
                    "🔥 De hielo sólido a vapor furioso: Moléculas en movimiento microscópico.",
                    "❄️ El calor como motor de los estados de agregación de la materia.",
                    "🧊 Reporte: ¿Por qué el agua hierve al ganar energía cinética?"
                ]
            },
            {
                id: "s-qui-3",
                titulo: "Solubilidad: Mezclas Saturadas",
                desc: "¿Cuánta sal puedes disolver en agua antes de que se quede en el fondo?",
                simTipo: "soluto",
                preguntasObs: [
                    "Al inicio la sal se disuelve por completo, pero al agregar demasiado queda sedimento en el fondo.",
                    "El agua disuelve cualquier cantidad infinita de sal sin saturarse jamás.",
                    "La sal flota en el aire al caer en el vaso de agua."
                ],
                preguntasProb: [
                    "¿Existe un límite máximo (solubilidad) para disolver sal en 100 mL de agua?",
                    "¿Por qué el agua salada es de color verde brillante?",
                    "¿Cómo afecta el ruido del salón a la disolución de sales?"
                ],
                hipCondiciones: ["Superamos el límite de saturación de soluto", "Calentamos el agua antes de poner la sal", "Removemos la cuchara más rápido"],
                hipEfectos: ["se formará un precipitado sólido en el fondo", "el agua se convertirá en hielo seco", "la sal desaparecerá del universo"],
                analisisOpciones: [
                    "Cada solvente tiene un punto de saturación límite a determinada temperatura.",
                    "La sal se disuelve mágicamente en cualquier proporción.",
                    "Calentar el agua disminuye la solubilidad de los sólidos."
                ],
                conclusionesOpciones: [
                    "Hipótesis confirmada: Al superar el coeficiente de solubilidad se crea una mezcla sobresaturada.",
                    "Hipótesis refutada: El agua admitió toda la sal sin dejar residuos.",
                    "Sin datos para calcular gramos disueltos."
                ],
                titularesCom: [
                    "🧂 ¡Hasta el límite!: Estudiantes hallan el punto de saturación de la sal.",
                    "💧 Solutos y solventes: La ciencia detrás de una mezcla homogénea.",
                    "⚗️ ¿Cuántas cucharadas soporta el agua? Experimento de solubilidad."
                ]
            }
        ],
        Biologia: [
            {
                id: "s-bio-1",
                titulo: "Ósmosis: Células e Hidratación",
                desc: "Mira células vegetales hincharse o arrugarse según la sal del medio exterior.",
                simTipo: "osmosis",
                preguntasObs: [
                    "En agua dulce las células se hinchan de agua; en agua con mucha sal se deshidratan y arrugan.",
                    "Las células explotan siempre sin importar en qué líquido se encuentren.",
                    "Las membranas celulares son muros de cemento donde nada entra ni sale."
                ],
                preguntasProb: [
                    "¿Cómo afecta la concentración de sal externa al volumen de una célula vegetal?",
                    "¿Por qué las células cambian de especie al ponerles agua?",
                    "¿De qué manera la sal alimenta a los cloroplastos?"
                ],
                hipCondiciones: ["Colocamos las células en solución salina hipertónica", "Sumergimos la célula en agua pura destilada", "Mantenemos un medio isotónico equilibrado"],
                hipEfectos: ["el agua saldrá de la célula encogiéndola (plasmólisis)", "la célula mantendrá su tamaño constante", "la célula se dividirá en 10 partes"],
                analisisOpciones: [
                    "El agua viaja a través de la membrana hacia donde hay mayor concentración de soluto.",
                    "La sal entra a la célula y el agua se queda completamente inmóvil.",
                    "El volumen celular es independiente de la solución externa."
                ],
                conclusionesOpciones: [
                    "Se confirma: El fenómeno de ósmosis regula el balance hídrico celular.",
                    "Se refuta: Las células mantuvieron la misma forma en todos los medios.",
                    "No se pudo observar la membrana al microscopio."
                ],
                titularesCom: [
                    "🔬 Ósmosis en vivo: El drama celular de deshidratarse en agua salada.",
                    "🌱 ¿Por qué no regar plantas con agua de mar? La biología responde.",
                    "🧫 Células bajo presión: Turgencia y plasmólisis al descubierto."
                ]
            },
            {
                id: "s-bio-2",
                titulo: "Fotosíntesis y Burbujas de Oxígeno",
                desc: "Coloca plantas acuáticas bajo focos de luz y cuenta las burbujas de oxígeno liberadas.",
                simTipo: "fotosintesis",
                preguntasObs: [
                    "A mayor intensidad de luz sobre la planta, se liberan más burbujas de gas (O2).",
                    "En la oscuridad total la planta produce 10 veces más burbujas.",
                    "Las hojas absorben oxígeno y expulsan dióxido de carbono continuamente."
                ],
                preguntasProb: [
                    "¿Cómo incide la intensidad lumínica en la tasa fotosintética de una planta?",
                    "¿Por qué las plantas son verdes cuando duermen?",
                    "¿Cuánto oxígeno necesita una piedra para respirar?"
                ],
                hipCondiciones: ["Aumentamos la intensidad del foco de luz", "Apagamos por completo la lámpara", "Cambiamos el agua por aceite vegetal"],
                hipEfectos: ["aumentará la tasa de producción de burbujas de oxígeno", "la producción de oxígeno descenderá a cero", "la planta cambiará de color a rojo fuego"],
                analisisOpciones: [
                    "La luz es la fuente de energía para descomponer el agua y fijar el carbono, produciendo O2.",
                    "La producción de oxígeno es totalmente aleatoria y no depende de la luz.",
                    "Las plantas no realizan fotosíntesis en agua."
                ],
                conclusionesOpciones: [
                    "Se valida: La tasa fotosintética tiene relación directa con la energía lumínica disponible.",
                    "Se refuta: La planta no produjo ninguna burbuja bajo luz intensa.",
                    "Incierto por falta de conteo de burbujas."
                ],
                titularesCom: [
                    "🌿 ¡Fábricas de vida!: Midiendo el oxígeno producido por plantas acuáticas.",
                    "☀️ Luz convertida en aire puro: El milagro de la fotosíntesis escolar.",
                    "🫧 Burbujas verdes: Cómo los vegetales alimentan al planeta."
                ]
            },
            {
                id: "s-bio-3",
                titulo: "Frecuencia Cardíaca y Esfuerzo Físico",
                desc: "¿Qué pasa con tu corazón cuando trotas o haces sentadillas? Simula el ritmo cardíaco.",
                simTipo: "cardio",
                preguntasObs: [
                    "Al incrementar la intensidad del ejercicio virtual, los latidos por minuto (LPM) aumentan.",
                    "El corazón se detiene durante el esfuerzo físico para ahorrar sangre.",
                    "La frecuencia cardíaca es igual en reposo que corriendo a máxima velocidad."
                ],
                preguntasProb: [
                    "¿Por qué el corazón bombea más rápido durante el ejercicio físico?",
                    "¿De qué manera la respiración cambia el color de los huesos?",
                    "¿Por qué los músculos no necesitan oxígeno al correr?"
                ],
                hipCondiciones: ["Realizamos ejercicio aeróbico intenso", "Permanecemos en reposo total", "Bebemos agua helada"],
                hipEfectos: ["el corazón bombeará más rápido para oxigenar los músculos", "la frecuencia cardíaca bajará a cero", "los vasos sanguíneos se cerrarán"],
                analisisOpciones: [
                    "El esfuerzo muscular demanda mayor aporte de O2 y nutrientes, elevando el gasto cardíaco.",
                    "El corazón late por azar sin importar la actividad del organismo.",
                    "El reposo requiere más sangre bombeada que el deporte."
                ],
                conclusionesOpciones: [
                    "Hipótesis respaldada: La homeostasis corporal modula el ritmo cardíaco según la demanda metabólica.",
                    "Hipótesis refutada: Los latidos disminuyeron durante la actividad física.",
                    "Datos insuficientes sobre pulso arterial."
                ],
                titularesCom: [
                    "❤️ ¡A mil por hora!: La respuesta cardíaca al ejercicio intenso.",
                    "🏃 Oxígeno para tus músculos: Por qué tu pulso se acelera al entrenar.",
                    "🩺 Simulación cardiovascular: Midiendo el ritmo vital en tiempo real."
                ]
            }
        ]
    },
    Preparatoria: {
        Fisica: [
            {
                id: "p-fis-1",
                titulo: "Tiro Parabólico y Cinemática 2D",
                desc: "Calcula el ángulo de disparo óptimo para maximizar el alcance horizontal.",
                simTipo: "parabolico",
                preguntasObs: [
                    "El proyectil describe una trayectoria en parábola curva por culpa de la gravedad.",
                    "El objeto viaja en línea recta horizontal infinita sin caer al suelo.",
                    "A 90 grados el proyectil logra la máxima distancia horizontal."
                ],
                preguntasProb: [
                    "¿Qué ángulo de lanzamiento garantiza el alcance horizontal máximo sin fricción?",
                    "¿Por qué los proyectiles se vuelven más ligeros en el aire?",
                    "¿Cómo influye el color del cañón en la distancia de impacto?"
                ],
                hipCondiciones: ["Disparamos con un ángulo de 45°", "Disparamos a 85° casi vertical", "Duplicamos la velocidad inicial V0"],
                hipEfectos: ["se obtendrá el alcance horizontal más largo posible", "el proyectil caerá sobre el cañón", "el alcance aumentará 4 veces"],
                analisisOpciones: [
                    "A 45 grados se optimiza el producto de sen(θ)·cos(θ), maximizando la distancia horizontal X.",
                    "El alcance solo depende del peso del proyectil y no del ángulo.",
                    "La gravedad acelera los objetos hacia arriba en tiro parabólico."
                ],
                conclusionesOpciones: [
                    "Se confirma: 45° es el ángulo de alcance máximo bajo aceleración gravitatoria constante.",
                    "Se refuta: Los tiros rasantes a 10° llegaron más lejos que a 45°.",
                    "Sin datos balísticos suficientes."
                ],
                titularesCom: [
                    "🎯 Balística cuántica: El ángulo perfecto de 45° demostrado con física.",
                    "🚀 Trayectorias curvas: Dominando el tiro parabólico en preparatoria.",
                    "📐 Vectores de velocidad y gravedad: El secreto de los lanzamientos."
                ]
            },
            {
                id: "p-fis-2",
                titulo: "Choques y Conservación del Momento",
                desc: "Haz colisionar dos carritos elásticos y calcula la cantidad de movimiento (p = m·v).",
                simTipo: "choque",
                preguntasObs: [
                    "Al chocar dos masas idénticas, se transfieren velocidad y momento lineal.",
                    "Los carritos se fusionan y desaparecen tras el impacto.",
                    "La masa pesada sale despedida más rápido que la liviana."
                ],
                preguntasProb: [
                    "¿Se conserva la cantidad de movimiento total (p) en una colisión elástica cerrada?",
                    "¿Por qué los choques producen luz ultravioleta?",
                    "¿Cómo cambia la masa del carrito al chocar contra la pared?"
                ],
                hipCondiciones: ["Chocamos dos carritos de igual masa en colisión elástica", "Un carro muy pesado choca a uno liviano quieto", "Aumentamos la fricción a niveles máximos"],
                hipEfectos: ["el carro en movimiento se frenará transfiriendo su velocidad al otro", "ambos carritos rebotarán a velocidad infinita", "el momento lineal se duplicará de la nada"],
                analisisOpciones: [
                    "El momento total inicial antes del impacto equivale exactamente al momento final.",
                    "La energía cinética siempre se pierde por completo en choques elásticos.",
                    "Los carritos aumentan su masa tras la colisión."
                ],
                conclusionesOpciones: [
                    "Se valida: En ausencia de fuerzas externas, la cantidad de movimiento se conserva.",
                    "Se refuta: El momento después del choque no coincidió con el inicial.",
                    "Inconcluso por error en cálculo de velocidades."
                ],
                titularesCom: [
                    "💥 ¡Impacto total!: Comprobando la conservación del momento lineal.",
                    "🎱 Física de bolas de billar: Colisiones elásticas bajo la lupa.",
                    "🏎️ Choques en el laboratorio: Cantidad de movimiento explicada."
                ]
            },
            {
                id: "p-fis-3",
                titulo: "Refracción de la Luz (Ley de Snell)",
                desc: "¿Por qué un lápiz parece quebrado en un vaso de agua? Mide los ángulos de la luz.",
                simTipo: "snell",
                preguntasObs: [
                    "El rayo de luz cambia de ángulo cuando pasa del aire al agua o al vidrio.",
                    "La luz se apaga al tocar cualquier sustancia transparente.",
                    "El rayo no sufre ninguna desviación sin importar el material."
                ],
                preguntasProb: [
                    "¿Cuál es la relación matemática entre los índices de refracción y los ángulos de la luz?",
                    "¿Por qué los espejos reflejan solo cosas bonitas?",
                    "¿Cómo influye la temperatura del foco en la velocidad de la luz en el vacío?"
                ],
                hipCondiciones: ["El rayo pasa del aire a un medio de mayor índice (agua/vidrio)", "El rayo incide perpendicularmente a 0 grados", "Usamos un rayo láser rojo en vez de azul"],
                hipEfectos: ["el rayo se desviará acercándose a la normal de la superficie", "el rayo viajará hacia atrás por reflexión total", "el rayo continuará sin doblarse"],
                analisisOpciones: [
                    "La Ley de Snell (n1·sen θ1 = n2·sen θ2) describe fielmente el cambio de velocidad de la luz en medios ópticos.",
                    "La luz viaja más rápido en el diamante que en el aire libre.",
                    "El ángulo refractado siempre es igual al incidente."
                ],
                conclusionesOpciones: [
                    "Se confirma: La velocidad de la luz disminuye en medios más densos provocando la refracción.",
                    "Se refuta: La luz no se desvió en ningún ángulo.",
                    "Sin transportador para medir grados."
                ],
                titularesCom: [
                    "🌈 La ilusión del lápiz quebrado: Descifrando la Ley de Snell.",
                    "💎 Viajando a través del vidrio: Óptica y refracción lumínica.",
                    "🔦 La luz bajo control: Midiendo índices de refracción en laboratorio."
                ]
            }
        ],
        Quimica: [
            {
                id: "p-qui-1",
                titulo: "Ley de los Gases Ideales (P·V = n·R·T)",
                desc: "Comprime un cilindro de gas o enfríalo y observa cómo sube la presión en el manómetro.",
                simTipo: "gas",
                preguntasObs: [
                    "Al comprimir el pistón reduciendo el volumen, la aguja de presión se dispara.",
                    "Al calentar el gas, la presión baja a cero de inmediato.",
                    "El volumen del gas nunca puede cambiar aunque bajemos el émbolo."
                ],
                preguntasProb: [
                    "¿Cómo se comporta la presión de un gas cuando reducimos su volumen a temperatura fija?",
                    "¿Por qué los gases no tienen moléculas en su interior?",
                    "¿De qué color es la masa de un gas ideal en reposo?"
                ],
                hipCondiciones: ["Reducimos el volumen del pistón a la mitad (Ley de Boyle)", "Aumentamos la temperatura al doble (Ley de Gay-Lussac)", "Extraemos la mitad de los moles de gas"],
                hipEfectos: ["la presión medida se duplicará", "la presión caerá a cero atmósferas", "el émbolo flotará sin peso"],
                analisisOpciones: [
                    "La presión y el volumen son inversamente proporcionales cuando la temperatura es constante.",
                    "Los gases ideales no sufren cambios de presión al comprimirse.",
                    "La temperatura no altera la energía de los choques moleculares."
                ],
                conclusionesOpciones: [
                    "Se confirma la ecuación de estado: P·V = n·R·T describe el comportamiento del sistema.",
                    "Se refuta: La presión disminuyó al achicar el volumen.",
                    "Incierto por fuga en el émbolo virtual."
                ],
                titularesCom: [
                    "💨 ¡Pistón bajo fuego!: Comprobando la Ley de los Gases Ideales.",
                    "🎈 De Boyle a Gay-Lussac: El universo molecular de la presión.",
                    "🌡️ Comprimiendo gases: Qué ocurre cuando encierras millones de moléculas."
                ]
            },
            {
                id: "p-qui-2",
                titulo: "Reacciones Exotérmicas y Endotérmicas",
                desc: "¿Liberar o absorber calor? Mide la entalpía (ΔH) de diferentes mezclas reactivas.",
                simTipo: "termoquimica",
                preguntasObs: [
                    "Ciertas mezclas liberan tanto calor que suben el termómetro; otras enfrían el vaso.",
                    "Todas las reacciones químicas se congelan a 0 grados centígrados.",
                    "La temperatura del universo siempre sube sin reacción química."
                ],
                preguntasProb: [
                    "¿Cuál es la diferencia energética entre una reacción con entalpía negativa (exotérmica) y una positiva?",
                    "¿Por qué los fuegos artificiales absorben el calor del aire?",
                    "¿Cómo calcular el peso del fuego con una balanza digital?"
                ],
                hipCondiciones: ["Iniciamos una reacción exotérmica de combustión", "Disolvemos nitrato de amonio en agua (endotérmica)", "Colocamos un catalizador inerte"],
                hipEfectos: ["el termómetro subirá rápidamente liberando energía térmica", "la temperatura descenderá enfriando el entorno", "no habrá ningún intercambio calórico"],
                analisisOpciones: [
                    "Las reacciones exotérmicas tienen productos con menor entalpía que los reactivos (ΔH < 0).",
                    "El calor siempre se destruye durante las mezclas químicas.",
                    "Las reacciones endotérmicas queman todo a su alrededor."
                ],
                conclusionesOpciones: [
                    "Se respalda: La variación de entalpía determina si el sistema cede o absorbe energía del entorno.",
                    "Se rechaza: El termómetro no registró ningún cambio de temperatura.",
                    "Faltan lecturas de Joules para evaluar el calor."
                ],
                titularesCom: [
                    "🔥 Calor en los enlaces: Descubriendo las reacciones exotérmicas.",
                    "🧊 El misterio químico del frío instantáneo: Termoquímica en acción.",
                    "⚗️ Entalpía y energía: La termodinámica de las reacciones cotidianas."
                ]
            },
            {
                id: "p-qui-3",
                titulo: "Cinética Química y Catalizadores",
                desc: "¿Cómo acelerar una reacción lenta? Añade un catalizador o aumenta la temperatura.",
                simTipo: "cinetica",
                preguntasObs: [
                    "Al añadir un catalizador o subir la temperatura, la reacción concluye en segundos.",
                    "Los catalizadores se destruyen y consumen por completo durante la reacción.",
                    "Enfriar los reactivos hace que reaccionen a mayor velocidad."
                ],
                preguntasProb: [
                    "¿De qué manera un catalizador modifica la energía de activación de un proceso químico?",
                    "¿Por qué las sustancias calientes se vuelven transparentes?",
                    "¿Cómo influye la marca del cronómetro en la cinética química?"
                ],
                hipCondiciones: ["Añadimos un catalizador a la mezcla reactiva", "Aumentamos la concentración de los reactivos", "Enfriamos el vaso a temperatura de hielo"],
                hipEfectos: ["la reacción ocurrirá mucho más rápido al bajar la energía de activación", "la reacción se detendrá para siempre", "los reactivos cambiarán de peso atómico"],
                analisisOpciones: [
                    "Los catalizadores ofrecen una ruta alternativa con menor energía de activación sin consumirse.",
                    "La velocidad de reacción no tiene relación con la temperatura.",
                    "Menos colisiones entre moléculas aumentan la velocidad de reacción."
                ],
                conclusionesOpciones: [
                    "Se confirma: La cinética química depende de la frecuencia de choques eficaces y de la barrera energética.",
                    "Se refuta: El catalizador frenó por completo la transformación química.",
                    "Sin datos para estimar la constante de velocidad k."
                ],
                titularesCom: [
                    "⚡ Acelerar sin consumirse: El superpoder de los catalizadores químicos.",
                    "⏱️ Cinética al milisegundo: Cómo dominar la velocidad de las reacciones.",
                    "🔬 Moléculas en choque: La teoría de colisiones comprobada en el lab."
                ]
            }
        ],
        Biologia: [
            {
                id: "p-bio-1",
                titulo: "Genética Mendeliana: Cruces de Punnett",
                desc: "Cruza plantas de flores rojas (RR) y blancas (rr) para descubrir las proporciones de Mendel.",
                simTipo: "genetica",
                preguntasObs: [
                    "En la primera generación todas las flores son rojas, pero el gen blanco reaparece en la F2.",
                    "Los genes de los padres se borran y se generan mutaciones sin herencia.",
                    "El 100% de los descendientes siempre son flores azules sin relación parental."
                ],
                preguntasProb: [
                    "¿Cuáles son las proporciones fenotípicas resultantes al cruzar dos individuos heterocigotos (Rr x Rr)?",
                    "¿Por qué las plantas deciden qué color de flor usar según su estado de ánimo?",
                    "¿Cómo influye la música clásica en los alelos de un guisante?"
                ],
                hipCondiciones: ["Cruzamos dos plantas heterocigotas Rr x Rr", "Cruzamos un homocigoto dominante con uno recesivo (RR x rr)", "Cruzamos dos homocigotos recesivos rr x rr"],
                hipEfectos: ["obtendremos una proporción 3:1 de flores rojas vs blancas", "todos los descendientes serán 100% idénticos al padre", "no nacerá ninguna semilla fértil"],
                analisisOpciones: [
                    "La segregación de alelos explica la aparición de una proporción 3 dominantes por cada 1 recesivo en F2.",
                    "La genética mendeliana no funciona con caracteres hereditarios simples.",
                    "Los alelos recesivos desaparecen para siempre del ADN."
                ],
                conclusionesOpciones: [
                    "Se valida: Las leyes de Mendel describen la probabilidad exacta de herencia biológica.",
                    "Se refuta: Los resultados contradicen el cuadro de Punnett.",
                    "Muestra estadística demasiado pequeña para validar proporciones."
                ],
                titularesCom: [
                    "🧬 El código de la herencia: Descifrando las proporciones de Mendel.",
                    "🌸 De flores rojas y blancas: La magia oculta de los alelos recesivos.",
                    "🎲 Probabilidad y vida: Cómo los cuadros de Punnett predicen rasgos."
                ]
            },
            {
                id: "p-bio-2",
                titulo: "Actividad Enzimática y Desnaturalización",
                desc: "¿Qué le ocurre a una enzima digestiva si subes la temperatura a más de 60 °C?",
                simTipo: "enzimas",
                preguntasObs: [
                    "La enzima trabaja a máxima velocidad a 37 °C, pero muere o deja de funcionar al hervir.",
                    "A 100 °C las enzimas son 50 veces más potentes y resistentes.",
                    "Las enzimas son seres vivos que tienen ojos y nadan en el tubo."
                ],
                preguntasProb: [
                    "¿Cómo afecta la temperatura excesiva a la estructura tridimensional de una enzima proteica?",
                    "¿Por qué la saliva es capaz de quemar el metal de los cubiertos?",
                    "¿Cuánto tiempo vive una proteína en un horno microondas?"
                ],
                hipCondiciones: ["Sometemos la enzima a una temperatura extrema (>60 °C)", "Mantenemos la enzima a su temperatura óptima de 37 °C", "Congelamos la enzima a -20 °C"],
                hipEfectos: ["se desnaturalizará perdiendo su sitio activo y su función biológica", "la enzima duplicará su velocidad metabólica", "la enzima se convertirá en un lípido graso"],
                analisisOpciones: [
                    "El calor excesivo rompe los puentes de hidrógeno, desnaturalizando la estructura terciaria de la proteína.",
                    "Las enzimas son indestructibles sin importar el calor o el pH.",
                    "La velocidad enzimática siempre crece de forma lineal infinita con la temperatura."
                ],
                conclusionesOpciones: [
                    "Se confirma: La desnaturalización térmica destruye la actividad catalítica de las enzimas.",
                    "Se refuta: La enzima hervida continuó degradando el sustrato sin problemas.",
                    "Sin datos sobre la velocidad de reacción enzimática."
                ],
                titularesCom: [
                    "🍳 El efecto del calor en las proteínas: ¿Por qué la fiebre alta es peligrosa?",
                    "🧪 Enzimas al rescate: El sitio activo como llave y cerradura biológica.",
                    "🔬 Desnaturalización celular: Cuando las máquinas del cuerpo dejan de funcionar."
                ]
            },
            {
                id: "p-bio-3",
                titulo: "Dinámica de Ecosistemas: Depredador-Presa",
                desc: "Equilibra conejos y zorros en un bosque virtual sin que ninguno se extinga.",
                simTipo: "poblaciones",
                preguntasObs: [
                    "Si hay muchos conejos, los zorros crecen; al haber muchos zorros, los conejos mueren y luego los zorros mueren de hambre.",
                    "Los conejos y los zorros viven en paz sin comerse entre sí jamás.",
                    "El número de animales en el bosque nunca cambia con el tiempo."
                ],
                preguntasProb: [
                    "¿Cómo regula la relación depredador-presa el tamaño poblacional de ambas especies?",
                    "¿Por qué los zorros se alimentan de luz solar en invierno?",
                    "¿Cómo afecta el canto de los pájaros a la natalidad de los conejos?"
                ],
                hipCondiciones: ["Aumentamos la población inicial de depredadores", "Eliminamos a todos los depredadores del bosque", "Mantenemos un equilibrio ecológico de recursos"],
                hipEfectos: ["la población de presas descenderá bruscamente por sobrecaza", "las presas se reproducirán sin límite consumiendo toda la vegetación", "ambas poblaciones oscilarán en ciclos estables"],
                analisisOpciones: [
                    "El modelo de Lotka-Volterra demuestra ciclos acoplados periódicos de abundancia entre presa y depredador.",
                    "Los depredadores siempre extinguen a sus presas sin excepción.",
                    "Los ecosistemas no tienen capacidad de carga límite."
                ],
                conclusionesOpciones: [
                    "Se respalda: La depredación actúa como un factor denso-dependiente que estabiliza el ecosistema.",
                    "Se rechaza: Las poblaciones no mostraron ninguna relación numérica entre sí.",
                    "Faltan años ecológicos de registro simulado."
                ],
                titularesCom: [
                    "🦊 Zorros y Conejos: La montaña rusa demográfica del modelo Lotka-Volterra.",
                    "🌲 El balance de la naturaleza: Por qué los ecosistemas necesitan depredadores.",
                    "📊 Ecología matemática: Simulando la supervivencia de especies en el lab."
                ]
            }
        ]
    }
};

// ==========================================
// GESTIÓN DE TEMA (MODO OSCURO / CLARO)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem("nexora_theme") || "dark";
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("nexora_theme", "light");
        const btn = $("themeToggleBtn");
        if (btn) btn.textContent = "☀️";
        const btn2 = $("btn-theme");
        if (btn2) btn2.textContent = "☀️";
    } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("nexora_theme", "dark");
        const btn = $("themeToggleBtn");
        if (btn) btn.textContent = "🌙";
        const btn2 = $("btn-theme");
        if (btn2) btn2.textContent = "🌙";
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const nextTheme = current === "light" ? "dark" : "light";
    applyTheme(nextTheme);
}

// ==========================================
// ESTADO DE RED Y MODAL DE CONFIGURACIÓN
// ==========================================
window.addEventListener('online', syncRed);
window.addEventListener('offline', syncRed);

function syncRed() {
    const pill = $("estado-red");
    if (!pill) return;
    if (navigator.onLine) {
        pill.innerText = "🟢 Conectado (IA Global lista)";
        pill.className = "pill online";
    } else {
        pill.innerText = "🔴 Sin Conexión (IA Local activa)";
        pill.className = "pill offline";
    }
}

function toggleModalConfig() {
    const modal = $("modal-config");
    if (!modal) return;
    modal.classList.toggle("hidden");
    const input = $("input-api-key");
    if (input) input.value = localStorage.getItem("nexora_gemini_key") || "";
}

function guardarApiKey() {
    const input = $("input-api-key");
    const key = input ? input.value.trim() : "";
    if (key) {
        localStorage.setItem("nexora_gemini_key", key);
        alert("¡Clave de Google Gemini guardada con éxito!");
    } else {
        localStorage.removeItem("nexora_gemini_key");
        alert("Clave eliminada. Se utilizará la IA Local Autónoma sin datos.");
    }
    toggleModalConfig();
}

// ==========================================
// REGISTRO DE ACTIVIDAD Y PROGRESO
// ==========================================
function saveProgress() {
    localStorage.setItem("nexoraExperiments", experiments);
    localStorage.setItem("nexoraCorrect", correctAnswers);
    localStorage.setItem("nexoraHistory", JSON.stringify(history));
    updateProgress();
}

function addActivity(description) {
    history.unshift({
        description,
        date: new Date().toLocaleString("es-MX")
    });

    history = history.slice(0, 25);
    saveProgress();
}

function updateProgress() {
    // Corregido para apuntar a los IDs correctos de index.html
    const expCountEl = $("totalExperiments");
    const quizScoreEl = $("correctAnswersDisplay");
    
    if (expCountEl) expCountEl.textContent = experiments;
    if (quizScoreEl) quizScoreEl.textContent = correctAnswers;

    const container = $("historyList");
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `<p style="color:var(--muted); font-size:14px;">Todavía no has realizado ninguna actividad en esta sesión.</p>`;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item" style="padding: 8px 0; border-bottom: 1px solid var(--border);">
            <strong>${escapeHTML(item.description)}</strong><br>
            <small style="color:var(--muted);">${escapeHTML(item.date)}</small>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ==========================================
// INICIO Y CIERRE DE SESIÓN
// ==========================================
// FLUJO DE INICIO DE SESIÓN Y SELECCIÓN DE NIVEL
// ==========================================
let materiaOrigen = "fisica";

function enterApp(name) {
    student = name;
    localStorage.setItem("nexoraStudent", student);

    const loginScreen = $("loginScreen");
    const levelScreen = $("levelScreen");
    const levelStudentName = $("levelStudentName");
    if (levelStudentName) levelStudentName.textContent = student;

    // Mostrar pantalla de selección de nivel escolar inmediatamente después del login
    if (loginScreen) loginScreen.classList.add("hidden");
    if (levelScreen) levelScreen.classList.remove("hidden");
}

function regresarAlLogin() {
    const levelScreen = $("levelScreen");
    const loginScreen = $("loginScreen");
    const appScreen = $("app");

    if (levelScreen) levelScreen.classList.add("hidden");
    if (appScreen) appScreen.classList.add("hidden");
    if (loginScreen) loginScreen.classList.remove("hidden");
}

function elegirNivelPrincipal(nivel) {
    nivelActual = nivel;
    localStorage.setItem("nexoraLevel", nivelActual);

    const levelScreen = $("levelScreen");
    const appScreen = $("app");
    if (levelScreen) levelScreen.classList.add("hidden");
    if (appScreen) appScreen.classList.remove("hidden");

    const welcomeName = $("welcomeName");
    const heroName = $("heroName");
    if (welcomeName) welcomeName.textContent = student;
    if (heroName) heroName.textContent = student;

    renderizarMisionesEnMaterias();
    updateProgress();
}

function abrirCambioNivel() {
    const levelScreen = $("levelScreen");
    const appScreen = $("app");
    const levelStudentName = $("levelStudentName");
    if (levelStudentName) levelStudentName.textContent = student || "Estudiante";

    if (appScreen) appScreen.classList.add("hidden");
    if (levelScreen) levelScreen.classList.remove("hidden");
}

const loginForm = $("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameInput = $("studentName");
        const passwordInput = $("studentPassword");
        const name = nameInput ? nameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (name.length < 2 || password.length < 4) {
            alert("Escribe un nombre y una contraseña de al menos 4 caracteres.");
            return;
        }

        enterApp(name);
    });
}

const logoutBtn = $("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        localStorage.removeItem("nexoraStudent");
        localStorage.removeItem("nexoraLevel");
        student = "";

        const appScreen = $("app");
        const levelScreen = $("levelScreen");
        const loginScreen = $("loginScreen");
        if (appScreen) appScreen.classList.add("hidden");
        if (levelScreen) levelScreen.classList.add("hidden");
        if (loginScreen) loginScreen.classList.remove("hidden");
        if (loginForm) loginForm.reset();
    });
}

// ==========================================
// NAVEGACIÓN GENERAL ENTRE SECCIONES
// ==========================================
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    const section = $(sectionId);
    if (!section) return;

    section.classList.add("active-section");

    const activeButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeButton) activeButton.classList.add("active");

    const titles = {
        inicio: "Bienvenido al laboratorio",
        fisica: "Laboratorio de Física",
        quimica: "Laboratorio de Química",
        biologia: "Laboratorio de Biología",
        evaluacion: "Evaluaciones",
        progreso: "Mi progreso",
        ia: "Asistente NEXOR-IA",
        "laboratorio-activo": "Método Científico en 7 Pasos"
    };

    const subtitles = {
        inicio: "Explora, experimenta y descubre.",
        fisica: "Misiones del método científico, constructor de 5 fórmulas y simuladores de movimiento.",
        quimica: "Misiones científicas, simulador conceptual de mezclas y modelo del átomo.",
        biologia: "Misiones biológicas, fotosíntesis interactiva y partes de la célula.",
        evaluacion: "Responde las preguntas y comprueba lo que has aprendido.",
        progreso: "Consulta las actividades y evaluaciones realizadas en este navegador.",
        ia: "Tu compañero con Inteligencia Artificial para responder dudas científicas.",
        "laboratorio-activo": "Experimenta con simuladores interactivos, registra mediciones y evalúa tu hipótesis."
    };

    const pageTitle = $("pageTitle");
    const pageSubtitle = $("pageSubtitle");
    if (pageTitle) pageTitle.textContent = titles[sectionId] || "Nexora LAB";
    if (pageSubtitle) pageSubtitle.textContent = subtitles[sectionId] || "Explora, experimenta y descubre.";

    if (sectionId === "progreso") updateProgress();
    if (sectionId === "fisica" || sectionId === "quimica" || sectionId === "biologia") {
        renderizarMisionesEnMaterias();
    }

    const mainContent = document.querySelector(".main-content");
    if (mainContent) mainContent.scrollTop = 0;
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });
});

// ==========================================
// RENDERIZADO DE LAS 18 MISIONES EN SUS MATERIAS
// ==========================================
function renderizarMisionesEnMaterias() {
    document.querySelectorAll(".txt-nivel-actual").forEach(el => {
        el.innerText = nivelActual;
    });

    const lblTopbar = $("lblNivelTopbar");
    if (lblTopbar) lblTopbar.innerText = nivelActual;

    const opuesto = (nivelActual === "Secundaria") ? "Preparatoria" : "Secundaria";
    const btnFis = $("btn-toggle-nivel-fisica");
    const btnQui = $("btn-toggle-nivel-quimica");
    const btnBio = $("btn-toggle-nivel-biologia");
    if (btnFis) btnFis.innerText = opuesto;
    if (btnQui) btnQui.innerText = opuesto;
    if (btnBio) btnBio.innerText = opuesto;

    renderizarListaMisiones("Fisica", $("lista-misiones-fisica"));
    renderizarListaMisiones("Quimica", $("lista-misiones-quimica"));
    renderizarListaMisiones("Biologia", $("lista-misiones-biologia"));
}

function renderizarListaMisiones(materia, contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const misiones = (dbExperimentos[nivelActual] && dbExperimentos[nivelActual][materia]) || [];
    misiones.forEach(exp => {
        const item = document.createElement("div");
        item.className = "exp-item";

        const badgeDiff = (exp.simTipo === "circuito" || exp.simTipo === "tiro" || exp.simTipo === "genetica") ? "alta" : "media";
        const diffText = badgeDiff === "alta" ? "Avanzado" : "Intermedio";

        item.innerHTML = `
            <div class="exp-item-content">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                    <span class="badge-dificultad ${badgeDiff}">${diffText}</span>
                    <h4 style="margin:0; font-size:16px;">${exp.titulo}</h4>
                </div>
                <p style="margin:0; font-size:13.5px; color:var(--muted);">${exp.desc}</p>
            </div>
            <button class="primary-btn" style="padding:9px 16px; font-size:13px; white-space:nowrap;">
                Iniciar Misión 🚀
            </button>
        `;
        item.onclick = () => {
            materiaActual = materia;
            iniciarMisionLaboratorio(exp);
        };
        contenedor.appendChild(item);
    });
}

function iniciarMisionLaboratorio(exp) {
    expActual = exp;
    materiaOrigen = materiaActual.toLowerCase();
    userSession = {
        observacionSeleccionada: "",
        observacionLibre: "",
        problemaSeleccionado: "",
        hipotesisCondicion: "",
        hipotesisEfecto: "",
        ensayos: [],
        analisisSeleccionado: "",
        conclusionSeleccionada: "",
        conclusionTexto: "",
        comunicacionTitular: ""
    };

    const labTitulo = $("lab-titulo");
    const labTag = $("lab-tag");
    if (labTitulo) labTitulo.innerText = exp.titulo;
    if (labTag) labTag.innerText = materiaActual.toUpperCase();

    const btnReopen = $("btn-reopen-circuit-box");
    if (btnReopen) {
        if (exp.simTipo === "circuito") btnReopen.classList.remove("hidden");
        else btnReopen.classList.add("hidden");
    }

    poblarOpcionesPaso1(exp);
    poblarOpcionesPaso2(exp);
    poblarConstructorPaso3(exp);
    configurarSimuladorPaso4(exp);
    poblarOpcionesPaso5(exp);
    poblarOpcionesPaso6(exp);
    poblarOpcionesPaso7(exp);

    showSection("laboratorio-activo");
    const vistaLab = $("vista-laboratorio");
    const vistaEval = $("vista-evaluacion");
    if (vistaLab) vistaLab.classList.remove("hidden");
    if (vistaEval) vistaEval.classList.add("hidden");

    cambiarPaso(1);
    if (exp.simTipo === "circuito") {
        abrirConstructorCircuito();
    }

    detectarSensores();
}

function salirDelLaboratorio() {
    detenerCanvasAnim();
    const vistaLab = $("vista-laboratorio");
    const vistaEval = $("vista-evaluacion");
    if (vistaLab) vistaLab.classList.add("hidden");
    if (vistaEval) vistaEval.classList.add("hidden");

    showSection(materiaOrigen || "fisica");
}

function reiniciarMisionActual() {
    if (expActual) {
        iniciarMisionLaboratorio(expActual);
    }
}

function cambiarPaso(paso) {
    pasoActual = paso;
    document.querySelectorAll(".step-card").forEach(c => c.classList.add("hidden"));

    const cardActual = document.querySelector(`.step-card[data-paso="${paso}"]`);
    if (cardActual) cardActual.classList.remove("hidden");

    const titulos = [
        "1. Observación", "2. Pregunta Problema", "3. Formulación de Hipótesis",
        "4. Experimentación Virtual", "5. Análisis de Mediciones", "6. Conclusión", "7. Divulgación"
    ];

    const stepName = $("step-name");
    const progressFill = $("progress-fill");
    if (stepName) stepName.innerText = `Paso ${paso}/7: ${titulos[paso - 1]}`;
    if (progressFill) progressFill.style.width = `${(paso / 7) * 100}%`;

    detenerCanvasAnim();

    if (paso === 1) {
        arrancarCanvas("canvas-obs", expActual.simTipo, true);
    } else if (paso === 4) {
        arrancarCanvas("canvas-exp", expActual.simTipo, false);
    } else if (paso === 5) {
        actualizarTablaPaso5();
    } else if (paso === 6) {
        const hipResumen = `Si ${userSession.hipotesisCondicion || '...'}, entonces ${userSession.hipotesisEfecto || '...'}.`;
        const txtRecordatorio = $("txt-recordatorio-hip");
        if (txtRecordatorio) txtRecordatorio.innerText = `"${hipResumen}"`;
    }
}

function avanzarPaso(pasoActual, pasoSiguiente) {
    if (pasoActual === 1 && !userSession.observacionSeleccionada) {
        alert("¡Selecciona al menos una observación de la lista para continuar!");
        return;
    }
    if (pasoActual === 2 && !userSession.problemaSeleccionado) {
        const probInput = $("input-problema-libre");
        const probLibre = probInput ? probInput.value.trim() : "";
        if (!probLibre) {
            alert("¡Elige una pregunta de investigación o escribe una en el botón 'escribe tu propia pregunta'!");
            return;
        }
        userSession.problemaSeleccionado = probLibre;
    }
    if (pasoActual === 5 && !userSession.analisisSeleccionado) {
        alert("¡Selecciona la tendencia que descubriste en tus datos!");
        return;
    }
    if (pasoActual === 6 && !userSession.conclusionSeleccionada) {
        alert("¡Elige si tu hipótesis fue confirmada o refutada con tus resultados!");
        return;
    }
    cambiarPaso(pasoSiguiente);
}

function poblarOpcionesPaso1(exp) {
    const contenedor = $("quiz-obs-options");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    exp.preguntasObs.forEach(texto => {
        const opt = document.createElement("div");
        opt.className = "quiz-option";
        opt.innerText = texto;
        opt.onclick = () => {
            contenedor.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            userSession.observacionSeleccionada = texto;
        };
        contenedor.appendChild(opt);
    });
}

function poblarOpcionesPaso2(exp) {
    const contenedor = $("quiz-problema-options");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    exp.preguntasProb.forEach(texto => {
        const opt = document.createElement("div");
        opt.className = "quiz-option";
        opt.innerText = texto;
        opt.onclick = () => {
            contenedor.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            userSession.problemaSeleccionado = texto;
        };
        contenedor.appendChild(opt);
    });
}

function toggleCustomInput(id) {
    const el = $(id);
    if (el) el.classList.toggle("hidden");
}

function poblarConstructorPaso3(exp) {
    const selectCond = $("hb-condicion");
    const selectEf = $("hb-efecto");
    if (!selectCond || !selectEf) return;

    selectCond.innerHTML = "";
    selectEf.innerHTML = "";

    exp.hipCondiciones.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        selectCond.appendChild(opt);
    });

    exp.hipEfectos.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e;
        opt.textContent = e;
        selectEf.appendChild(opt);
    });

    actualizarPrevisualizacionHipotesis();
}

function actualizarPrevisualizacionHipotesis() {
    const condEl = $("hb-condicion");
    const efEl = $("hb-efecto");
    const c = condEl ? condEl.value : "";
    const e = efEl ? efEl.value : "";
    userSession.hipotesisCondicion = c;
    userSession.hipotesisEfecto = e;
    const preview = $("hb-preview-text");
    if (preview) preview.innerText = `"Si ${c.toLowerCase()}, entonces ${e.toLowerCase()}."`;
}

function poblarOpcionesPaso5(exp) {
    const contenedor = $("quiz-analisis-options");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    exp.analisisOpciones.forEach(txt => {
        const opt = document.createElement("div");
        opt.className = "quiz-option";
        opt.innerText = txt;
        opt.onclick = () => {
            contenedor.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            userSession.analisisSeleccionado = txt;
        };
        contenedor.appendChild(opt);
    });
}

function poblarOpcionesPaso6(exp) {
    const contenedor = $("quiz-conclusion-options");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    exp.conclusionesOpciones.forEach(txt => {
        const opt = document.createElement("div");
        opt.className = "quiz-option";
        opt.innerText = txt;
        opt.onclick = () => {
            contenedor.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            userSession.conclusionSeleccionada = txt;
        };
        contenedor.appendChild(opt);
    });
}

function poblarOpcionesPaso7(exp) {
    const contenedor = $("quiz-comunicacion-options");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    exp.titularesCom.forEach(txt => {
        const opt = document.createElement("div");
        opt.className = "quiz-option";
        opt.innerText = txt;
        opt.onclick = () => {
            contenedor.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            userSession.comunicacionTitular = txt;
        };
        contenedor.appendChild(opt);
    });
}

// ==========================================
// ==========================================
// SIMULADORES EN VIVO Y CONTROLES DEL PASO 4
// ==========================================
function configurarSimuladorPaso4(exp) {
    const contenedor = $("sim-controls-container");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Reset de tabla en vivo en Paso 4
    const tbodyPaso4 = $("tbody-ensayos-paso4");
    if (tbodyPaso4) {
        tbodyPaso4.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:10px;">Presiona el botón del simulador para registrar tu primer ensayo.</td></tr>`;
    }
    const badgePaso4 = $("badge-contador-ensayos");
    if (badgePaso4) {
        badgePaso4.innerText = "0 ensayos";
        badgePaso4.style.background = "";
        badgePaso4.style.color = "";
    }

    if (exp.simTipo === "fuerza" || exp.simTipo === "choque" || exp.simTipo === "newton") {
        simVars.fuerza = 14;
        simVars.masa = 2.0;

        contenedor.innerHTML = `
            <div class="control-item" style="margin-bottom: 12px;">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>Fuerza Aplicada: <b id="val-ctrl-fuerza">14</b> N</span>
                </div>
                <input type="range" class="slider" min="5" max="80" value="14" oninput="actualizarVarFuerza(this.value)">
            </div>

            <div class="control-item" style="margin-bottom: 15px;">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>Masa del Carro: <b id="val-ctrl-masa">2.0</b> kg</span>
                </div>
                <input type="range" class="slider" min="0.5" max="5.0" step="0.5" value="2.0" oninput="actualizarVarMasa(this.value)">
            </div>

            <button class="btn primary-btn" onclick="lanzarPruebaNewton()">▶ Aplicar Impulso y Medir</button>
        `;
    } else if (exp.simTipo === "ph") {
        simVars.param1 = 7.0;
        contenedor.innerHTML = `
            <div style="display:flex; gap:10px; margin-top:0;">
                <button class="btn secondary-btn" onclick="accionarReactivoPH('acido')">+ Ácido Clorhídrico</button>
                <button class="btn secondary-btn" onclick="accionarReactivoPH('base')">+ Hidróxido de Sodio</button>
            </div>
            <div style="text-align:center; margin-top:14px; font-size:15px;">
                pH de la solución: <b id="val-ph-live" style="color:var(--cyan); font-size:20px;">7.00</b>
            </div>
        `;
    } else if (exp.simTipo === "circuito") {
        simVars.param1 = 35;
        contenedor.innerHTML = `
            <div class="control-item" style="margin-bottom: 12px;">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>Voltaje de Fuente DC: <b id="val-ctrl1">35 V</b></span>
                </div>
                <input type="range" class="slider" min="5" max="60" value="35" oninput="actualizarSlider(1, this.value, ' V')">
            </div>
            <div class="control-item" style="margin-bottom: 14px;">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>Resistencia de Carga: <b>10.0 Ω</b></span>
                </div>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn primary-btn" onclick="ejecutarEnsayoSimulado('Medición con Amperímetro')">⚡ Registrar Corriente (I = V / R)</button>
                <button class="btn secondary-btn" onclick="abrirConstructorCircuito()">🔌 Taller de Ensamblaje</button>
            </div>
        `;
    } else if (exp.simTipo === "pendulo") {
        simVars.param1 = 45;
        contenedor.innerHTML = `
            <div class="control-item">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Amplitud / Apertura: <b id="val-ctrl1">45°</b></span></div>
                <input type="range" class="slider" min="15" max="85" value="45" oninput="actualizarSlider(1, this.value, '°')">
            </div>
            <button class="btn primary-btn" onclick="ejecutarEnsayoSimulado('Medición de Péndulo')">⏱️ Registrar Lectura del Péndulo</button>
        `;
    } else {
        simVars.param1 = 50;
        contenedor.innerHTML = `
            <div class="control-item">
                <div class="control-header" style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Intensidad de Entrada: <b id="val-ctrl1">50 %</b></span></div>
                <input type="range" class="slider" min="10" max="100" value="50" oninput="actualizarSlider(1, this.value, ' %')">
            </div>
            <button class="btn primary-btn" onclick="ejecutarEnsayoSimulado('Medición de Parámetro')">🚀 Registrar Lectura</button>
        `;
    }
}

function actualizarVarFuerza(val) {
    simVars.fuerza = parseFloat(val);
    const tag = $("val-ctrl-fuerza");
    if (tag) tag.innerText = val;
}

function actualizarVarMasa(val) {
    simVars.masa = parseFloat(val);
    const tag = $("val-ctrl-masa");
    if (tag) tag.innerText = parseFloat(val).toFixed(1);
}

function lanzarPruebaNewton() {
    const fuerza = simVars.fuerza || 14;
    const masa = simVars.masa || 2.0;
    const aceleracion = (fuerza / masa).toFixed(2);

    simVars.impulsoActivo = true;
    simVars.velocidadAcc = parseFloat(aceleracion);

    registrarFilaTabla(
        `Fuerza = ${fuerza} N, Masa = ${masa} kg`,
        `Aceleración = ${aceleracion} m/s²`,
        aceleracion > 20 ? "Aceleración Alta" : "Aceleración Normal"
    );
}

function actualizarSlider(num, val, unit) {
    simVars.param1 = parseFloat(val);
    const tag = $("val-ctrl" + num);
    if (tag) tag.innerText = val + unit;
}

function accionarReactivoPH(tipo) {
    if (tipo === 'acido') {
        simVars.param1 = Math.max(1.0, simVars.param1 - 1.2);
    } else {
        simVars.param1 = Math.min(14.0, simVars.param1 + 1.2);
    }
    const valTag = $("val-ph-live");
    if (valTag) valTag.innerText = simVars.param1.toFixed(2);

    registrarFilaTabla(
        `Gotas de ${tipo.toUpperCase()}`,
        `pH = ${simVars.param1.toFixed(2)}`,
        simVars.param1 < 7 ? "Ácido" : simVars.param1 > 7 ? "Base" : "Neutro"
    );
}

function ejecutarEnsayoSimulado(nombreAccion) {
    let medicion = "";
    let estado = "Normal";

    if (expActual && (expActual.simTipo === "fuerza" || expActual.simTipo === "newton")) {
        const acel = (simVars.param1 / 2.5).toFixed(2);
        medicion = `Aceleración: ${acel} m/s²`;
        estado = acel > 20 ? "Aceleración Alta" : "Aceleración Normal";
    } else if (expActual && expActual.simTipo === "circuito") {
        const V = simVars.param1 || 35;
        const R = 10;
        const amperes = (V / R).toFixed(2);
        medicion = `Corriente I = ${V}V / ${R}Ω = ${amperes} A`;
        estado = amperes > 3.0 ? "Brillo Intenso" : amperes > 1.5 ? "Brillo Normal" : "Brillo Tenue";
    } else if (expActual && expActual.simTipo === "pendulo") {
        const periodo = (2 * Math.PI * Math.sqrt(1 / 9.8)).toFixed(2);
        medicion = `Periodo = ${periodo} s (Amplitud = ${simVars.param1}°)`;
        estado = "Oscilación Estable";
    } else {
        medicion = `Respuesta = ${(simVars.param1 * 1.34).toFixed(1)} unidades`;
        estado = "Registro Válido";
    }

    registrarFilaTabla(`${nombreAccion} (${simVars.param1 || ''})`, medicion, estado);
}

function registrarFilaTabla(control, resultado, estado) {
    const num = userSession.ensayos.length + 1;
    const nuevoEnsayo = { num, control, resultado, estado };
    userSession.ensayos.push(nuevoEnsayo);

    // 1. Insertar en tabla en vivo de Paso 4
    const tbodyPaso4 = $("tbody-ensayos-paso4");
    if (tbodyPaso4) {
        if (num === 1) tbodyPaso4.innerHTML = "";
        const tr4 = document.createElement("tr");
        tr4.innerHTML = `
            <td><b>#${num}</b></td>
            <td>${control}</td>
            <td style="color:var(--cyan); font-weight:700;">${resultado}</td>
            <td><span class="pill">${estado}</span></td>
        `;
        tbodyPaso4.appendChild(tr4);
    }

    const badgePaso4 = $("badge-contador-ensayos");
    if (badgePaso4) {
        badgePaso4.innerText = `${num} ensayo${num > 1 ? 's' : ''}`;
        badgePaso4.style.background = "var(--cyan)";
        badgePaso4.style.color = "#071526";
    }

    // 2. Sincronizar tabla de Paso 5
    actualizarTablaPaso5();

    experiments++;
    addActivity(`Ensayo #${num} en ${expActual ? expActual.titulo : "Laboratorio"}: ${resultado}`);
}

function actualizarTablaPaso5() {
    const tbodyPaso5 = $("tbody-ensayos");
    if (!tbodyPaso5) return;

    if (!userSession.ensayos || userSession.ensayos.length === 0) {
        tbodyPaso5.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:16px;">Realiza ensayos en el Paso 4 para ver datos aquí.</td></tr>`;
        return;
    }

    tbodyPaso5.innerHTML = "";
    userSession.ensayos.forEach(e => {
        const tr5 = document.createElement("tr");
        tr5.innerHTML = `
            <td><b>#${e.num}</b></td>
            <td>${e.control}</td>
            <td style="color:var(--cyan); font-weight:700;">${e.resultado}</td>
            <td><span class="pill">${e.estado}</span></td>
        `;
        tbodyPaso5.appendChild(tr5);
    });
}

function detenerCanvasAnim() {
    if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
}

// ==========================================
// RENDERIZADO DEL CANVAS INTERACTIVO (FÍSICA 2D)
// ==========================================
function arrancarCanvas(canvasId, tipo, esDemo) {
    detenerCanvasAnim();
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let xPos = 40;
    let t = 0;
    let velocidadActual = 0;
    let carroEnElBorde = false;
    let isDragging = false;

    if (simVars.anguloPendulo === undefined) {
        simVars.anguloPendulo = (45 * Math.PI) / 180;
        simVars.velAngular = 0;
        simVars.isDraggingPendulo = false;
    }

    // Dragging para Carro en Newton/Fuerza
    if ((tipo === "fuerza" || tipo === "choque" || tipo === "newton") && !canvas._dragListenersAttached) {
        canvas._dragListenersAttached = true;

        const iniciarCarro = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (clientX - rect.left) * (canvas.width / rect.width);
            const mouseY = (clientY - rect.top) * (canvas.height / rect.height);
            if (mouseX >= xPos - 15 && mouseX <= xPos + 75 && mouseY >= canvas.height - 75 && mouseY <= canvas.height - 20) {
                isDragging = true;
            }
        };

        const moverCarro = (clientX) => {
            if (!isDragging) return;
            const rect = canvas.getBoundingClientRect();
            let mouseX = (clientX - rect.left) * (canvas.width / rect.width);
            xPos = Math.max(40, Math.min(mouseX - 30, canvas.width - 70));
            velocidadActual = 0;
            if (xPos < canvas.width - 70) carroEnElBorde = false;
        };

        const soltarCarro = () => { isDragging = false; };

        canvas.addEventListener('mousedown', (e) => iniciarCarro(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => moverCarro(e.clientX));
        window.addEventListener('mouseup', soltarCarro);

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) iniciarCarro(e.touches[0].clientX, e.touches[0].clientY);
        });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) moverCarro(e.touches[0].clientX);
        });
        window.addEventListener('touchend', soltarCarro);
    }

    // Dragging para Péndulo
    if (tipo === "pendulo" && !canvas._penduloListenersAttached) {
        canvas._penduloListenersAttached = true;
        const cx = canvas.width / 2;
        const cy = 30;
        const longitudCuerda = 120;

        const iniciarPendulo = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (clientX - rect.left) * (canvas.width / rect.width);
            const my = (clientY - rect.top) * (canvas.height / rect.height);

            const xEsfera = cx + longitudCuerda * Math.sin(simVars.anguloPendulo);
            const yEsfera = cy + longitudCuerda * Math.cos(simVars.anguloPendulo);

            const distancia = Math.hypot(mx - xEsfera, my - yEsfera);
            if (distancia < 40) {
                simVars.isDraggingPendulo = true;
                simVars.velAngular = 0;
            }
        };

        const moverPendulo = (clientX, clientY) => {
            if (!simVars.isDraggingPendulo) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (clientX - rect.left) * (canvas.width / rect.width);
            const my = (clientY - rect.top) * (canvas.height / rect.height);

            const dx = mx - cx;
            const dy = my - cy;
            let nuevoAngulo = Math.atan2(dx, dy);

            const limiteMax = (75 * Math.PI) / 180;
            simVars.anguloPendulo = Math.max(-limiteMax, Math.min(limiteMax, nuevoAngulo));
            simVars.velAngular = 0;

            const gradosActuales = Math.round((Math.abs(simVars.anguloPendulo) * 180) / Math.PI);
            simVars.param1 = gradosActuales;

            const tagCtrl = $("val-ctrl1");
            if (tagCtrl) tagCtrl.innerText = gradosActuales + "°";
            const sliderCtrl = document.querySelector(".controls-card .slider");
            if (sliderCtrl) sliderCtrl.value = gradosActuales;
        };

        const soltarPendulo = () => { simVars.isDraggingPendulo = false; };

        canvas.addEventListener('mousedown', (e) => iniciarPendulo(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => moverPendulo(e.clientX, e.clientY));
        window.addEventListener('mouseup', soltarPendulo);

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) iniciarPendulo(e.touches[0].clientX, e.touches[0].clientY);
        });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) moverPendulo(e.touches[0].clientX);
        });
        window.addEventListener('touchend', soltarPendulo);
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.04;

        if (tipo === "fuerza" || tipo === "choque" || tipo === "newton") {
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 30);
            ctx.lineTo(canvas.width, canvas.height - 30);
            ctx.stroke();

            if (esDemo) {
                xPos = 120 + Math.sin(t * 2) * 80;
            } else {
                if (simVars.impulsoActivo) {
                    velocidadActual = (simVars.velocidadAcc || 2.0) * 0.4;
                    simVars.impulsoActivo = false;
                    carroEnElBorde = false;
                }

                if (!isDragging) {
                    if (velocidadActual > 0.05) {
                        xPos += velocidadActual;
                        velocidadActual *= 0.96;
                    } else {
                        velocidadActual = 0;
                    }
                }

                if (xPos >= canvas.width - 70 && velocidadActual <= 0.05 && !isDragging) {
                    xPos = canvas.width - 70;
                    velocidadActual = 0;
                    carroEnElBorde = true;
                }

                if (sensorActivo) {
                    xPos += sensorTilt * 2;
                }
            }

            ctx.fillStyle = isDragging ? "#10b981" : "#00e5ff";
            ctx.shadowColor = isDragging ? "#10b981" : "#00e5ff";
            ctx.shadowBlur = 10;
            ctx.fillRect(xPos, canvas.height - 65, 60, 25);
            ctx.shadowBlur = 0;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(xPos + 12, canvas.height - 38, 7, 0, Math.PI * 2);
            ctx.arc(xPos + 48, canvas.height - 38, 7, 0, Math.PI * 2);
            ctx.fill();

            if (carroEnElBorde && !esDemo) {
                ctx.fillStyle = "rgba(10, 14, 20, 0.85)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#00e5ff";
                ctx.font = "bold 14px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("⚠️ ¡El carro se ha detenido al final de la pista!", canvas.width / 2, canvas.height / 2 - 15);

                ctx.fillStyle = "#ffffff";
                ctx.font = "12px system-ui, sans-serif";
                ctx.fillText("👆 Mantén presionado y desliza el carro hacia la izquierda para reiniciar", canvas.width / 2, canvas.height / 2 + 10);
                ctx.textAlign = "left";
            }

        } else if (tipo === "ph") {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const col = simVars.param1 < 6 ? "#ef4444" : simVars.param1 > 8 ? "#a855f7" : "#10b981";

            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 15;
            ctx.fillRect(cx - 50, cy - 20, 100, 100);
            ctx.shadowBlur = 0;

            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 4;
            ctx.strokeRect(cx - 55, cy - 30, 110, 115);

        } else if (tipo === "pendulo") {
            const cx = canvas.width / 2;
            const cy = 30;
            const longitudCuerda = 120;
            const g = 0.4;

            if (!simVars.isDraggingPendulo) {
                const aceleracionAngular = (-g / longitudCuerda) * Math.sin(simVars.anguloPendulo);
                simVars.velAngular += aceleracionAngular;
                simVars.anguloPendulo += simVars.velAngular;
                simVars.velAngular *= 0.998;
            }

            const xEsfera = cx + longitudCuerda * Math.sin(simVars.anguloPendulo);
            const yEsfera = cy + longitudCuerda * Math.cos(simVars.anguloPendulo);

            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(cx - 20, cy - 10, 40, 8);

            ctx.strokeStyle = simVars.isDraggingPendulo ? "#10b981" : "#38bdf8";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEsfera, yEsfera);
            ctx.stroke();

            ctx.fillStyle = simVars.isDraggingPendulo ? "#10b981" : "#a855f7";
            ctx.shadowColor = simVars.isDraggingPendulo ? "#10b981" : "#a855f7";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(xEsfera, yEsfera, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (simVars.isDraggingPendulo) {
                const grados = Math.round((Math.abs(simVars.anguloPendulo) * 180) / Math.PI);
                ctx.fillStyle = "rgba(10, 14, 20, 0.85)";
                ctx.fillRect(cx - 60, canvas.height - 40, 120, 30);
                ctx.strokeStyle = "#10b981";
                ctx.strokeRect(cx - 60, canvas.height - 40, 120, 30);

                ctx.fillStyle = "#10b981";
                ctx.font = "bold 13px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`Ángulo: ${grados}°`, cx, canvas.height - 21);
                ctx.textAlign = "left";
            }

        } else if (tipo === "circuito") {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const V = simVars.param1 || 9;

            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.strokeRect(cx - 160, cy - 70, 320, 140);

            // Batería
            ctx.fillStyle = "#0a0e14";
            ctx.fillRect(cx - 165, cy - 25, 10, 50);
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(cx - 170, cy - 20, 20, 40);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText(`${V}V`, cx - 198, cy + 5);

            // Interruptor cerrado
            ctx.fillStyle = "#0a0e14";
            ctx.fillRect(cx - 30, cy - 75, 60, 10);
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(cx - 25, cy - 70);
            ctx.lineTo(cx + 25, cy - 70);
            ctx.stroke();

            // Resistencia
            ctx.fillStyle = "#0a0e14";
            ctx.fillRect(cx + 155, cy - 20, 10, 40);
            ctx.strokeStyle = "#a855f7";
            ctx.beginPath();
            ctx.moveTo(cx + 160, cy - 20);
            ctx.lineTo(cx + 170, cy - 10);
            ctx.lineTo(cx + 150, cy);
            ctx.lineTo(cx + 170, cy + 10);
            ctx.lineTo(cx + 160, cy + 20);
            ctx.stroke();

            // Bombilla
            const brillo = Math.min(1, V / 15);
            ctx.fillStyle = `rgba(255, 235, 59, ${0.2 + brillo * 0.8})`;
            ctx.shadowColor = "#ffee55";
            ctx.shadowBlur = brillo * 25;
            ctx.beginPath();
            ctx.arc(cx, cy + 70, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Electrones
            ctx.fillStyle = "#00e5ff";
            const numElectrones = 8;
            for (let i = 0; i < numElectrones; i++) {
                const pos = ((t * 60 + i * (640 / numElectrones)) % 640);
                let ex = cx - 160, ey = cy - 70;
                if (pos < 320) {
                    ex = cx - 160 + pos;
                    ey = cy - 70;
                } else if (pos < 460) {
                    ex = cx + 160;
                    ey = cy - 70 + (pos - 320);
                } else if (pos < 640) {
                    ex = cx + 160 - (pos - 460);
                    ey = cy + 70;
                }
                ctx.beginPath();
                ctx.arc(ex, ey, 3, 0, Math.PI * 2);
                ctx.fill();
            }

        } else {
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 3;
            ctx.shadowColor = "#a855f7";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 20) {
                let y = (canvas.height / 2) + Math.sin(t + i * 0.05) * 35;
                if (i === 0) ctx.moveTo(i, y);
                else ctx.lineTo(i, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        animId = requestAnimationFrame(render);
    }
    render();
}

// ==========================================
// SENSORES DE HARDWARE (MÓVIL)
// ==========================================
function detectarSensores() {
    if (window.DeviceMotionEvent) {
        const box = $("sensor-btn-box");
        if (box) box.classList.remove("hidden");
    }
}

function activarAcelerometroMovil() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(state => {
            if (state === 'granted') escucharMovimiento();
        }).catch(console.warn);
    } else {
        escucharMovimiento();
    }
}

function escucharMovimiento() {
    window.addEventListener("devicemotion", (e) => {
        if (e.accelerationIncludingGravity) {
            sensorTilt = e.accelerationIncludingGravity.x || 0;
            sensorActivo = true;
        }
    });
    alert("¡Sensor de inclinación vinculado! Mueve tu móvil para interactuar con la simulación.");
}

// ==========================================
// EVALUACIÓN FINAL POR IA HÍBRIDA
// (GOOGLE GEMINI + IA LOCAL AUTÓNOMA)
// ==========================================
async function ejecutarEvaluacionFinal() {
    const vistaLab = $("vista-laboratorio");
    const vistaEval = $("vista-evaluacion");
    if (vistaLab) vistaLab.classList.add("hidden");
    if (vistaEval) vistaEval.classList.remove("hidden");

    const loader = $("eval-loader");
    const content = $("eval-content");
    const motorTag = $("eval-motor");
    const rankTag = $("eval-rank-badge") || $("eval-badge-rank");

    if (loader) loader.classList.remove("hidden");
    if (content) content.classList.add("hidden");

    const obsInput = $("input-obs-extra");
    const concInput = $("input-conclusion-texto");
    userSession.observacionLibre = obsInput ? obsInput.value.trim() : "";
    userSession.conclusionTexto = concInput ? concInput.value.trim() : "";

    const apiKey = localStorage.getItem("nexora_gemini_key");
    let dictamen = null;

    if (navigator.onLine && apiKey) {
        try {
            if (motorTag) motorTag.innerText = "IA Global Cloud (Google Gemini)";
            dictamen = await consultarIAGlobalGemini(apiKey);
        } catch (err) {
            console.warn("Fallo nube, conmutando a IA Local Heurística:", err);
            if (motorTag) motorTag.innerText = "IA Local Autónoma (Offline)";
            dictamen = evaluarConIALocalAdaptada();
        }
    } else {
        if (motorTag) motorTag.innerText = "IA Local Autónoma (Offline)";
        dictamen = evaluarConIALocalAdaptada();
    }

    if (!dictamen) {
        dictamen = evaluarConIALocalAdaptada();
    }

    if (loader) loader.classList.add("hidden");

    if (rankTag) {
        if (dictamen.puntaje >= 90) {
            rankTag.innerText = "Rango: Maestro Científico";
            rankTag.style.background = "linear-gradient(90deg, #10b981, #00e5ff)";
        } else if (dictamen.puntaje >= 75) {
            rankTag.innerText = "Rango: Investigador Cuántico";
            rankTag.style.background = "linear-gradient(90deg, #f59e0b, #ec4899)";
        } else {
            rankTag.innerText = "Rango: Explorador Novato";
            rankTag.style.background = "linear-gradient(90deg, #3b82f6, #8b5cf6)";
        }
    }

    const scoreNum = $("eval-score-num");
    if (scoreNum) scoreNum.innerText = `${dictamen.puntaje} / 100 PTS`;

    const feedbackText = $("eval-ai-feedback-text");
    if (feedbackText) feedbackText.innerText = dictamen.mensajeGeneral;

    const breakdown = $("eval-steps-breakdown");
    if (breakdown) {
        let htmlPasos = "";
        (dictamen.rubrica || []).forEach(item => {
            htmlPasos += `
                <div class="eval-step-row ${item.aprobado ? 'pass' : 'warn'}" style="background: rgba(255,255,255,0.04); border-left: 4px solid ${item.aprobado ? 'var(--green, #54e6a5)' : 'var(--pink, #ff70b7)'}; padding: 12px 14px; border-radius: 8px; margin-bottom: 10px;">
                    <b style="color: ${item.aprobado ? 'var(--green, #54e6a5)' : 'var(--pink, #ff70b7)'}">${item.aprobado ? '✔ Logrado' : '⚠️ Atención'} - ${item.paso}:</b>
                    <p style="color: var(--muted, #a9b8ce); margin-top: 4px; font-size: 14px;">${item.mensaje}</p>
                </div>
            `;
        });
        breakdown.innerHTML = htmlPasos;
    }

    if (content) {
        content.classList.remove("hidden");
    }

    experiments++;
    addActivity(`Evaluación IA completada: ${expActual ? expActual.titulo : "Misión"} (${dictamen.puntaje} pts)`);
}

function evaluarConIALocalAdaptada() {
    let score = 0;
    let rubrica = [];

    if (userSession.observacionSeleccionada) {
        score += 15;
        rubrica.push({ paso: "1. Observación", aprobado: true, mensaje: "Identificaste el fenómeno físico con precisión visual." });
    } else {
        rubrica.push({ paso: "1. Observación", aprobado: false, mensaje: "No seleccionaste ninguna observación concreta." });
    }

    if (userSession.problemaSeleccionado) {
        score += 15;
        rubrica.push({ paso: "2. Planteamiento", aprobado: true, mensaje: "Formulaste una pregunta con relación causal de variables." });
    }

    if (userSession.hipotesisCondicion && userSession.hipotesisEfecto) {
        score += 20;
        rubrica.push({ paso: "3. Hipótesis", aprobado: true, mensaje: `Excelente construcción lógica: 'Si ${userSession.hipotesisCondicion}, entonces ${userSession.hipotesisEfecto}'.` });
    }

    if (userSession.ensayos.length >= 2) {
        score += 20;
        rubrica.push({ paso: "4. Experimentación", aprobado: true, mensaje: `Rigor científico: ejecutaste ${userSession.ensayos.length} pruebas controladas en el simulador.` });
    } else {
        score += 5;
        rubrica.push({ paso: "4. Experimentación", aprobado: false, mensaje: "Hiciste menos de 2 ensayos; se requieren repeticiones para verificar consistencia." });
    }

    if (userSession.conclusionSeleccionada.includes("confirma") || userSession.conclusionSeleccionada.includes("valida")) {
        score += 15;
        rubrica.push({ paso: "5 & 6. Análisis y Conclusión", aprobado: true, mensaje: "Contrastaste con acierto las mediciones contra tu hipótesis." });
    } else {
        score += 10;
        rubrica.push({ paso: "5 & 6. Análisis y Conclusión", aprobado: true, mensaje: "Conclusión honesta con base en datos empíricos." });
    }

    if (userSession.comunicacionTitular) {
        score += 15;
        rubrica.push({ paso: "7. Divulgación", aprobado: true, mensaje: "Elegiste un titular claro y atractivo para la comunidad científica." });
    }

    return {
        puntaje: score,
        mensajeGeneral: score >= 80
            ? "¡Trabajo científico sobresaliente! Demostraste pensamiento crítico y análisis cuantitativo impecable."
            : "¡Buen intento! Desarrollaste el método científico con éxito, aunque puedes mejorar realizando más ensayos experimentales.",
        rubrica
    };
}

async function consultarIAGlobalGemini(apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
Eres un tutor de ciencias juvenil y motivador evaluando a un estudiante de ${nivelActual} (12-18 años).
Tema: ${expActual ? expActual.titulo : "Física"}.
Respuestas del alumno:
- Observación: ${userSession.observacionSeleccionada}
- Pregunta: ${userSession.problemaSeleccionado}
- Hipótesis: Si ${userSession.hipotesisCondicion}, entonces ${userSession.hipotesisEfecto}.
- Ensayos en tabla: ${userSession.ensayos.length} pruebas realizadas.
- Análisis: ${userSession.analisisSeleccionado}
- Conclusión: ${userSession.conclusionSeleccionada}

Devuelve ÚNICAMENTE un JSON válido con esta estructura estricta:
{
  "puntaje": [un número entre 60 y 100],
  "mensajeGeneral": "[mensaje motivador para el joven de 2 líneas]",
  "rubrica": [
    {"paso": "Observación y Pregunta", "aprobado": true, "mensaje": "..."},
    {"paso": "Hipótesis Causal", "aprobado": true, "mensaje": "..."},
    {"paso": "Experimentación y Análisis", "aprobado": true, "mensaje": "..."},
    {"paso": "Conclusión Crítica", "aprobado": true, "mensaje": "..."}
  ]
}
`;

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) throw new Error("Fallo en API Nube");

    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
}

function revisarPasoActual() {
    const vistaEval = $("vista-evaluacion");
    const vistaLab = $("vista-laboratorio");
    if (vistaEval) vistaEval.classList.add("hidden");
    if (vistaLab) vistaLab.classList.remove("hidden");
    cambiarPaso(5);
}

function reiniciarALista() {
    detenerCanvasAnim();
    const vistaEval = $("vista-evaluacion");
    const menuMaterias = $("menu-materias");
    if (vistaEval) vistaEval.classList.add("hidden");
    if (menuMaterias) menuMaterias.classList.remove("hidden");
}

// ==========================================
// TALLER DE ENSAMBLAJE DE CIRCUITOS (MODAL)
// ==========================================
// TALLER DE ENSAMBLAJE DE CIRCUITOS (CON LÍNEAS PUNTEADAS & DRAG & DROP)
// EXACTO A IMAGEN 2 (BATERÍA 35V, INTERRUPTOR, RESISTENCIA 10Ω, BOMBILLA)
// ==========================================
let circuitoArmado = {
    bateria: false,
    switch: false,
    resistencia: false,
    bombilla: false
};
let draggedCircuitComponent = null;
let selectedCircuitComponent = null;

function abrirConstructorCircuito() {
    circuitoArmado = { bateria: false, switch: false, resistencia: false, bombilla: false };
    selectedCircuitComponent = null;
    draggedCircuitComponent = null;

    const modal = $("modal-builder-circuito");
    if (modal) modal.classList.remove("hidden");

    const board = $("circuitBoardExact") || $("circuitBoard");
    if (board) board.classList.remove("energized");

    // Restablecer los 4 slots con líneas punteadas
    ["bateria", "switch", "resistencia", "bombilla"].forEach(resetSlotDisplay);

    // Restablecer los 4 componentes en la bandeja lateral
    ["drag-comp-bateria", "drag-comp-switch", "drag-comp-resistencia", "drag-comp-bombilla"].forEach(resetComponentTray);

    const successBox = $("circuit-success-box");
    if (successBox) successBox.classList.add("hidden");
}

function resetSlotDisplay(tipo) {
    const outline = $("outline-" + tipo);
    const placed = $("placed-" + tipo);
    if (outline) outline.classList.remove("hidden");
    if (placed) placed.classList.add("hidden");
}

function resetComponentTray(id) {
    const comp = $(id);
    if (comp) {
        comp.classList.remove("used");
        comp.style.outline = "none";
    }
}

function cerrarConstructorCircuito() {
    const modal = $("modal-builder-circuito");
    if (modal) modal.classList.add("hidden");
}

// Drag & Drop nativo de HTML5
function handleCircuitDragStart(event, tipo) {
    draggedCircuitComponent = tipo;
    if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", tipo);
        event.dataTransfer.effectAllowed = "move";
    }
}

function handleCircuitDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
    }
    event.currentTarget.classList.add("drag-over");
}

function handleCircuitDragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
}

function handleCircuitDrop(event, targetTipo) {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
    const tipo = (event.dataTransfer ? event.dataTransfer.getData("text/plain") : null) || draggedCircuitComponent;
    if (!tipo) return;

    if (tipo === targetTipo) {
        colocarComponenteEnSlot(tipo);
    } else {
        const nombres = {
            bateria: "Batería (35V)",
            switch: "Interruptor",
            resistencia: "Resistencia (10 Ω)",
            bombilla: "Bombilla"
        };
        alert(`¡Atención! Ese componente (${nombres[tipo] || tipo}) no corresponde a esta posición. Arrástralo a su recuadro punteado específico en el circuito.`);
    }
}

// Soporte táctil / clic para móviles y accesibilidad
function seleccionarComponente(tipo) {
    if (circuitoArmado[tipo]) return;
    selectedCircuitComponent = tipo;

    ["bateria", "switch", "resistencia", "bombilla"].forEach(t => {
        const c = $("drag-comp-" + t);
        if (c) c.style.outline = (t === tipo) ? "2px solid var(--cyan)" : "none";
    });

    // En pantallas táctiles o clic directo: colocar en su ranura
    colocarComponenteEnSlot(tipo);
}

function handleSlotClick(slotTipo) {
    if (selectedCircuitComponent === slotTipo) {
        colocarComponenteEnSlot(slotTipo);
    } else if (!circuitoArmado[slotTipo]) {
        colocarComponenteEnSlot(slotTipo);
    }
}

function colocarComponenteEnSlot(tipo) {
    if (circuitoArmado[tipo]) return;
    circuitoArmado[tipo] = true;

    const outline = $("outline-" + tipo);
    const placed = $("placed-" + tipo);
    if (outline) outline.classList.add("hidden");
    if (placed) placed.classList.remove("hidden");

    const compTray = $("drag-comp-" + tipo);
    if (compTray) {
        compTray.classList.add("used");
        compTray.style.outline = "none";
    }

    selectedCircuitComponent = null;

    // Verificar si los 4 componentes de la Imagen 2 ya están instalados
    if (circuitoArmado.bateria && circuitoArmado.switch && circuitoArmado.resistencia && circuitoArmado.bombilla) {
        energizarCircuito();
    }
}

function ensamblarCircuitoCompleto() {
    ["bateria", "switch", "resistencia", "bombilla"].forEach(tipo => {
        colocarComponenteEnSlot(tipo);
    });
}

function energizarCircuito() {
    const board = $("circuitBoardExact") || $("circuitBoard");
    if (board) board.classList.add("energized");

    const successBox = $("circuit-success-box");
    if (successBox) successBox.classList.remove("hidden");
}

function completarConstruccionCircuito() {
    cerrarConstructorCircuito();
    cambiarPaso(1);
    addActivity("Taller de ensamblaje: Circuito 35V / 10Ω completado y energizado con éxito.");
}

// Vinculación global explícita para compatibilidad total con eventos inline y móviles
window.colocarComponenteEnSlot = colocarComponenteEnSlot;
window.ensamblarCircuitoCompleto = ensamblarCircuitoCompleto;
window.seleccionarComponente = seleccionarComponente;
window.handleSlotClick = handleSlotClick;
window.handleCircuitDragStart = handleCircuitDragStart;
window.handleCircuitDragOver = handleCircuitDragOver;
window.handleCircuitDragLeave = handleCircuitDragLeave;
window.handleCircuitDrop = handleCircuitDrop;
window.completarConstruccionCircuito = completarConstruccionCircuito;
window.abrirConstructorCircuito = abrirConstructorCircuito;
window.cerrarConstructorCircuito = cerrarConstructorCircuito;

// ==========================================
// SIMULADORES DEL VIDEO TUTORIAL
// ==========================================

// --- FÍSICA: VELOCIDAD ---
function calculateSpeed() {
    const distance = Number($("distance").value);
    const time = Number($("time").value);

    if (!Number.isFinite(distance) || !Number.isFinite(time) || distance < 0 || time <= 0) {
        $("speedResult").textContent = "Introduce una distancia válida y un tiempo mayor que cero.";
        return;
    }

    const speed = distance / time;

    $("speedResult").innerHTML = `
        <strong>Resultado: ${speed.toFixed(2)} m/s</strong><br>
        Fórmula: velocidad = distancia ÷ tiempo.<br>
        Operación: ${distance} ÷ ${time} = ${speed.toFixed(2)} m/s.
    `;

    experiments++;
    addActivity("Simulación de velocidad en Física");
}

// --- FÍSICA: LEY DE OHM ---
function calculateOhm() {
    const voltage = Number($("voltage").value);
    const resistance = Number($("resistance").value);

    if (!Number.isFinite(voltage) || !Number.isFinite(resistance) || voltage < 0 || resistance <= 0) {
        $("ohmResult").textContent = "Introduce valores válidos. La resistencia debe ser mayor que cero.";
        return;
    }

    const current = voltage / resistance;

    $("ohmResult").innerHTML = `
        <strong>Corriente: ${current.toFixed(2)} amperios</strong><br>
        Fórmula: I = V ÷ R.<br>
        Operación: ${voltage} ÷ ${resistance} = ${current.toFixed(2)} A.
    `;

    experiments++;
    addActivity("Simulación de la ley de Ohm");
}

// --- CONSTRUCTOR DE FÓRMULAS DINÁMICAS (FEATURE DEL VIDEO) ---
const formulasConfig = {
    velocidad: {
        title: "Velocidad",
        formulaStr: "v = Distancia / Tiempo",
        procedureStr: "Se sustituyeron los valores introducidos en la fórmula seleccionada.",
        unit: "m/s",
        fields: [
            { id: "dyn_distance", label: "Distancia (metros)", placeholder: "Introduce distancia", defaultVal: "12", min: "0", step: "any" },
            { id: "dyn_time", label: "Tiempo (segundos)", placeholder: "Introduce tiempo", defaultVal: "34", min: "0.0001", step: "any" }
        ],
        calculate: (vals) => {
            const d = parseFloat(vals.dyn_distance);
            const t = parseFloat(vals.dyn_time);
            if (isNaN(d) || isNaN(t) || t <= 0) return null;
            return d / t;
        }
    },
    fuerza: {
        title: "Fuerza (Segunda Ley de Newton)",
        formulaStr: "F = Masa × Aceleración",
        procedureStr: "Se sustituyeron los valores introducidos en la fórmula seleccionada.",
        unit: "N",
        fields: [
            { id: "dyn_mass", label: "Masa (kg)", placeholder: "Introduce masa", defaultVal: "10", min: "0", step: "any" },
            { id: "dyn_accel", label: "Aceleración (m/s²)", placeholder: "Introduce aceleración", defaultVal: "9.8", min: "0", step: "any" }
        ],
        calculate: (vals) => {
            const m = parseFloat(vals.dyn_mass);
            const a = parseFloat(vals.dyn_accel);
            if (isNaN(m) || isNaN(a)) return null;
            return m * a;
        }
    },
    densidad: {
        title: "Densidad",
        formulaStr: "d = Masa / Volumen",
        procedureStr: "Se sustituyeron los valores introducidos en la fórmula seleccionada.",
        unit: "kg/m³",
        fields: [
            { id: "dyn_mass", label: "Masa (kg)", placeholder: "Introduce masa", defaultVal: "50", min: "0", step: "any" },
            { id: "dyn_volume", label: "Volumen (m³)", placeholder: "Introduce volumen", defaultVal: "2", min: "0.0001", step: "any" }
        ],
        calculate: (vals) => {
            const m = parseFloat(vals.dyn_mass);
            const v = parseFloat(vals.dyn_volume);
            if (isNaN(m) || isNaN(v) || v <= 0) return null;
            return m / v;
        }
    },
    energia: {
        title: "Energía cinética",
        formulaStr: "Ec = 0.5 × Masa × (Velocidad)²",
        procedureStr: "Se sustituyeron los valores introducidos en la fórmula seleccionada.",
        unit: "J",
        fields: [
            { id: "dyn_mass", label: "Masa (kg)", placeholder: "Introduce masa", defaultVal: "15", min: "0", step: "any" },
            { id: "dyn_vel", label: "Velocidad (m/s)", placeholder: "Introduce velocidad", defaultVal: "4", min: "0", step: "any" }
        ],
        calculate: (vals) => {
            const m = parseFloat(vals.dyn_mass);
            const v = parseFloat(vals.dyn_vel);
            if (isNaN(m) || isNaN(v)) return null;
            return 0.5 * m * (v * v);
        }
    },
    ohm: {
        title: "Ley de Ohm",
        formulaStr: "I = Voltaje / Resistencia",
        procedureStr: "Se sustituyeron los valores introducidos en la fórmula seleccionada.",
        unit: "A",
        fields: [
            { id: "dyn_volt", label: "Voltaje (V)", placeholder: "Introduce voltaje", defaultVal: "12", min: "0", step: "any" },
            { id: "dyn_res", label: "Resistencia (Ω)", placeholder: "Introduce resistencia", defaultVal: "4", min: "0.0001", step: "any" }
        ],
        calculate: (vals) => {
            const v = parseFloat(vals.dyn_volt);
            const r = parseFloat(vals.dyn_res);
            if (isNaN(v) || isNaN(r) || r <= 0) return null;
            return v / r;
        }
    }
};

function onFormulaChange() {
    const select = $("formulaSelect");
    const container = $("formulaInputs");
    const calcBtn = $("calculateFormulaBtn");
    const badge = $("formulaResultBadge");
    const details = $("formulaResultDetails");
    const placeholder = $("formulaPlaceholder");

    if (!select || !container) return;

    const key = select.value;
    const config = formulasConfig[key];

    if (!config) {
        container.innerHTML = "";
        if (calcBtn) calcBtn.classList.add("hidden");
        if (badge) badge.classList.add("hidden");
        if (details) details.classList.add("hidden");
        if (placeholder) {
            placeholder.classList.remove("hidden");
            placeholder.textContent = "Selecciona una fórmula para comenzar.";
        }
        return;
    }

    container.innerHTML = config.fields.map(field => `
        <div>
            <label for="${field.id}">${field.label}</label>
            <input type="number" id="${field.id}" placeholder="${field.placeholder}" value="${field.defaultVal}" min="${field.min}" step="${field.step}">
        </div>
    `).join("");

    if (calcBtn) calcBtn.classList.remove("hidden");
    if (badge) badge.classList.add("hidden");
    if (details) details.classList.add("hidden");
    if (placeholder) {
        placeholder.classList.remove("hidden");
        placeholder.textContent = "Modifica las variables para calcular.";
    }
}

function calculateDynamicFormula() {
    const select = $("formulaSelect");
    if (!select) return;

    const key = select.value;
    const config = formulasConfig[key];
    if (!config) return;

    const vals = {};
    config.fields.forEach(f => {
        const input = $(f.id);
        vals[f.id] = input ? input.value : "";
    });

    const result = config.calculate(vals);

    const badge = $("formulaResultBadge");
    const badgeVal = $("formulaResultValue");
    const details = $("formulaResultDetails");
    const formulaText = $("formulaFormulaText");
    const procText = $("formulaProcedureText");
    const detailRes = $("formulaDetailResult");
    const placeholder = $("formulaPlaceholder");

    if (result === null || !Number.isFinite(result)) {
        if (placeholder) {
            placeholder.classList.remove("hidden");
            placeholder.textContent = "Introduce valores válidos mayores a cero para realizar el cálculo.";
        }
        if (badge) badge.classList.add("hidden");
        if (details) details.classList.add("hidden");
        return;
    }

    const formatted = parseFloat(result.toFixed(4)) + " " + config.unit;

    if (badgeVal) badgeVal.textContent = formatted;
    if (badge) badge.classList.remove("hidden");

    if (formulaText) formulaText.textContent = config.formulaStr;
    if (procText) procText.textContent = config.procedureStr;
    if (detailRes) detailRes.textContent = formatted;
    if (details) details.classList.remove("hidden");
    if (placeholder) placeholder.classList.add("hidden");

    experiments++;
    addActivity(`Cálculo de fórmula dinámica: ${config.title}`);
}

const formulaSelectEl = $("formulaSelect");
if (formulaSelectEl) {
    formulaSelectEl.addEventListener("change", onFormulaChange);
}

const calculateFormulaBtnEl = $("calculateFormulaBtn");
if (calculateFormulaBtnEl) {
    calculateFormulaBtnEl.addEventListener("click", calculateDynamicFormula);
}

// --- QUÍMICA: MEZCLAS CONCEPTUALES ---
const substanceNames = {
    agua: "agua",
    aceite: "aceite",
    sal: "sal",
    azucar: "azúcar",
    arena: "arena"
};

function mixSubstances() {
    const first = $("substanceOne").value;
    const second = $("substanceTwo").value;

    const beaker = $("beakerEmoji");
    if (beaker) {
        beaker.classList.remove("mixing");
        void beaker.offsetWidth;
        beaker.classList.add("mixing");
    }

    let result = "";

    if (first === second) {
        result = `Has seleccionado dos muestras de ${substanceNames[first]}. Al ser la misma sustancia, no estás combinando materiales diferentes.`;
    } else if (
        (first === "agua" && second === "sal") ||
        (first === "sal" && second === "agua")
    ) {
        result = "En condiciones habituales, la sal puede disolverse en agua y formar una mezcla homogénea.";
    } else if (
        (first === "agua" && second === "azucar") ||
        (first === "azucar" && second === "agua")
    ) {
        result = "El azúcar puede disolverse en agua. Se obtiene una mezcla homogénea.";
    } else if (
        (first === "agua" && second === "aceite") ||
        (first === "aceite" && second === "agua")
    ) {
        result = "El agua y el aceite no se mezclan de manera uniforme. Se observan dos fases.";
    } else if (
        (first === "agua" && second === "arena") ||
        (first === "arena" && second === "agua")
    ) {
        result = "La arena no se disuelve en agua. Sus partículas pueden quedar suspendidas y después sedimentarse.";
    } else if (
        (first === "aceite" && second === "sal") ||
        (first === "sal" && second === "aceite")
    ) {
        result = "La sal no se disuelve de manera apreciable en aceite. Se mantiene como material separado.";
    } else if (
        (first === "aceite" && second === "azucar") ||
        (first === "azucar" && second === "aceite")
    ) {
        result = "El azúcar no se disuelve de manera apreciable en aceite. La mezcla no es uniforme.";
    } else {
        result = "Esta combinación no se representa con suficiente detalle en este modelo. Investiga las propiedades de cada material.";
    }

    const mixResultEl = $("mixResult");
    if (mixResultEl) mixResultEl.textContent = result;

    experiments++;
    addActivity("Simulación conceptual de mezclas en Química");
}

// --- BIOLOGÍA: FOTOSÍNTESIS ---
const lightSliderEl = $("lightSlider");
if (lightSliderEl) {
    lightSliderEl.addEventListener("input", function() {
        const light = Number(this.value);

        $("lightValue").textContent = light + "%";

        if (light < 20) {
            $("plantEmoji").textContent = "🌱";
            $("photoResult").textContent =
                "Con poca luz, la fotosíntesis puede verse limitada. La planta necesita luz para realizar este proceso.";
        } else if (light < 70) {
            $("plantEmoji").textContent = "🌿";
            $("photoResult").textContent =
                "La planta cuenta con una intensidad de luz intermedia. La luz es uno de los factores que intervienen en la fotosíntesis.";
        } else {
            $("plantEmoji").textContent = "🌳";
            $("photoResult").textContent =
                "El modelo representa una disponibilidad alta de luz. Recuerda que la fotosíntesis también depende del agua, el dióxido de carbono y otros factores.";
        }
    });

    lightSliderEl.addEventListener("change", function() {
        experiments++;
        addActivity("Exploración del modelo de fotosíntesis");
    });
}

// ==========================================
// EVALUACIONES (6 PREGUNTAS ORIGINALES)
// ==========================================
const questions = [
    {
        question: "¿Qué fórmula permite calcular la velocidad media?",
        options: [
            "Distancia ÷ tiempo",
            "Tiempo ÷ distancia",
            "Distancia × masa"
        ],
        answer: 0,
        explanation: "La velocidad media se calcula dividiendo la distancia recorrida entre el tiempo empleado."
    },
    {
        question: "¿Qué establece la ley de Ohm?",
        options: [
            "La relación entre masa y volumen",
            "La relación entre voltaje, corriente y resistencia",
            "La relación entre luz y temperatura"
        ],
        answer: 1,
        explanation: "La ley de Ohm se expresa como V = I × R."
    },
    {
        question: "¿Qué ocurre cuando la sal se disuelve en agua?",
        options: [
            "Se forma una mezcla homogénea",
            "Se convierte en un metal",
            "Desaparece la materia"
        ],
        answer: 0,
        explanation: "La sal se dispersa en el agua formando una disolución homogénea."
    },
    {
        question: "¿Qué estructura contiene el material genético de una célula eucariota?",
        options: [
            "Membrana",
            "Núcleo",
            "Pared celular"
        ],
        answer: 1,
        explanation: "El núcleo de las células eucariotas contiene la mayor parte del material genético."
    },
    {
        question: "¿Qué necesita una planta para realizar la fotosíntesis?",
        options: [
            "Luz, agua y dióxido de carbono",
            "Arena, aceite y sal",
            "Únicamente oxígeno"
        ],
        answer: 0,
        explanation: "La fotosíntesis utiliza energía luminosa, agua y dióxido de carbono para producir azúcares y liberar oxígeno."
    },
    {
        question: "¿Qué partícula tiene carga eléctrica negativa?",
        options: [
            "Protón",
            "Neutrón",
            "Electrón"
        ],
        answer: 2,
        explanation: "El electrón tiene carga negativa; el protón tiene carga positiva y el neutrón no tiene carga."
    }
];

let currentQuestion = 0;
let questionAnswered = false;
let sessionScore = 0;

function loadQuestion() {
    const question = questions[currentQuestion];
    if (!question) return;

    const counterEl = $("quizProgress") || $("quizCounter");
    if (counterEl) {
        counterEl.textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
    }

    const scoreEl = $("quizScore");
    if (scoreEl) {
        scoreEl.textContent = `Aciertos: ${sessionScore}`;
    }

    const questionEl = $("quizQuestion");
    if (questionEl) {
        questionEl.textContent = question.question;
    }

    const feedback = $("quizFeedback");
    const nextBtn = $("nextQuestionBtn") || $("nextQuestion");
    const restartBtn = $("restartQuizBtn") || $("restartQuiz");
    if (feedback) feedback.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
    if (restartBtn) restartBtn.classList.add("hidden");

    const container = $("quizOptions");
    if (!container) return;
    container.innerHTML = "";

    questionAnswered = false;

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.className = "quiz-option";
        button.textContent = option;
        button.addEventListener("click", () => selectAnswer(index));
        container.appendChild(button);
    });
}

function selectAnswer(index) {
    if (questionAnswered) return;
    questionAnswered = true;

    const question = questions[currentQuestion];
    const buttons = document.querySelectorAll(".quiz-option");

    buttons.forEach(button => button.disabled = true);

    const isCorrect = index === question.answer;

    const feedback = $("quizFeedback");
    if (isCorrect) {
        sessionScore++;
        correctAnswers++;
        const scoreEl = $("quizScore");
        if (scoreEl) scoreEl.textContent = `Aciertos: ${sessionScore}`;
        if (feedback) feedback.textContent = "¡Correcto! ⭐ " + question.explanation;
    } else {
        if (feedback) feedback.textContent = "Todavía puedes aprender. " + question.explanation;
    }

    if (feedback) feedback.classList.remove("hidden");

    const nextBtn = $("nextQuestionBtn") || $("nextQuestion");
    if (nextBtn) nextBtn.classList.remove("hidden");

    if (buttons[question.answer]) {
        buttons[question.answer].style.borderColor = "#54e6a5";
    }

    if (!isCorrect && buttons[index]) {
        buttons[index].style.borderColor = "#ff70b7";
    }

    addActivity(isCorrect
        ? "Respuesta correcta en evaluación"
        : "Pregunta revisada en evaluación"
    );
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= questions.length) {
        finishQuiz();
    } else {
        loadQuestion();
    }
}
window.nextQuestion = nextQuestion;

const nextQuestionBtn = $("nextQuestionBtn") || $("nextQuestion");
if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", nextQuestion);
}

function finishQuiz() {
    const questionEl = $("quizQuestion");
    if (questionEl) questionEl.textContent = "¡Evaluación terminada! 🎉";

    const optionsContainer = $("quizOptions");
    if (optionsContainer) optionsContainer.innerHTML = "";

    const feedback = $("quizFeedback");
    if (feedback) {
        feedback.classList.remove("hidden");
        feedback.textContent = `Obtuviste ${sessionScore} respuestas correctas de ${questions.length}.`;
    }

    const nextBtn = $("nextQuestionBtn") || $("nextQuestion");
    if (nextBtn) nextBtn.classList.add("hidden");

    const counterEl = $("quizProgress") || $("quizCounter");
    if (counterEl) counterEl.textContent = "Finalizado";

    const restartBtn = $("restartQuizBtn") || $("restartQuiz");
    if (restartBtn) {
        restartBtn.classList.remove("hidden");
        restartBtn.textContent = "🔄 Volver a intentar";
    }
}

function restartQuiz() {
    currentQuestion = 0;
    sessionScore = 0;
    const restartBtn = $("restartQuizBtn") || $("restartQuiz");
    if (restartBtn) restartBtn.classList.add("hidden");
    loadQuestion();
}
window.restartQuiz = restartQuiz;

const restartQuizBtn = $("restartQuizBtn") || $("restartQuiz");
if (restartQuizBtn) {
    restartQuizBtn.addEventListener("click", restartQuiz);
}

// ==========================================
// NEXOR-IA: ASISTENTE EDUCATIVO
// ==========================================
function getAIResponse(question) {
    const text = question.toLowerCase().trim();

    // === PEGA AQUÍ TUS NUEVAS VALIDACIONES EXACTAS ===
    if (/^(gracias|muchas gracias|te agradezco|gracias por tu ayuda)[!. ]*$/.test(text)) {
        return "¡Con gusto! Me alegra ayudarte a aprender. ¿Qué otro tema científico te gustaría explorar?";
    }

    if (/^(adios|hasta luego|nos vemos|bye|hasta pronto)[!. ]*$/.test(text)) {
        return "¡Hasta pronto! Sigue explorando y aprendiendo en Nexora LAB. Aquí podrás continuar tus descubrimientos científicos.";
    }

    if (/^(quien eres|como te llamas|que eres)$/.test(text)) {
        return "Soy NEXOR-IA, el asistente inteligente de Nexora LAB. Estoy diseñado para ayudarte a comprender conceptos, resolver dudas y explorar experimentos de Física, Química y Biología.";
    }

    if (/^(que puedes hacer|para que sirves|como puedes ayudarme)$/.test(text)) {
        return "Puedo explicarte temas científicos, ayudarte a comprender fórmulas, analizar fenómenos, orientar tus experimentos virtuales y responder preguntas de Física, Química y Biología.";
    }
    // =================================================

    // Validaciones anteriores basadas en "includes"
    if (text.includes("hola") || text.includes("buenos") || text.includes("saludos")) {
        return "¡Hola! Soy NEXOR-IA, tu asistente científico. Puedo ayudarte con las 18 misiones del laboratorio, resolver tus dudas sobre el método científico y ayudarte a calcular fórmulas físicas.";
    }

    if (text.includes("mision") || text.includes("misiones") || text.includes("experimento")) {
        return "En la pestaña 'Misiones Científicas' tienes 18 experimentos interactivos para Secundaria y Preparatoria en Física, Química y Biología. Puedes formular hipótesis, medir datos y ser evaluado por IA.";
    }

    // ... (el resto de tus condiciones y el return final) ...

    return `¡Gran pregunta científica! En relación a "${escapeHTML(question)}": en ciencia siempre partimos de observar el fenómeno, plantear una hipótesis y realizar pruebas empíricas. ¿Deseas explorar Física, Química o Biología?`;
}

const chatFormEl = $("chatForm");
if (chatFormEl) {
    chatFormEl.addEventListener("submit", function(event) {
        event.preventDefault();

        const input = $("chatInput");
        const question = input ? input.value.trim() : "";

        if (!question) return;

        addMessage(question, "user-message");
        input.value = "";

        setTimeout(() => {
            const response = getAIResponse(question);
            addMessage(response, "bot-message");
        }, 350);
    });
}

function addMessage(text, className) {
    const container = $("chatMessages");
    if (!container) return;

    const message = document.createElement("div");
    message.className = "message " + className;
    message.textContent = text;

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

// ==========================================
// INICIALIZACIÓN COMPLETA AL CARGAR LA PÁGINA
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    syncRed();

    const themeToggleBtn = $("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleTheme);
    }

    loadQuestion();

    const savedLevel = localStorage.getItem("nexoraLevel");
    if (savedLevel) {
        nivelActual = savedLevel;
    }

    if (student) {
        const studentInput = $("studentName");
        if (studentInput) studentInput.value = student;
        if (savedLevel) {
            elegirNivelPrincipal(savedLevel);
        } else {
            enterApp(student);
        }
    } else {
        renderizarMisionesEnMaterias();
    }
});
