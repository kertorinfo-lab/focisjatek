// Player name data based on nationality
// This can be expanded with many more names and nationalities
const REAL_PLAYERS = {
    "Manchester City": [
        { id: 'mc_haaland', name: 'Erling Haaland', position: 'CS', age: 24, rating: 91, value: 180000000, nationality: 'no' },
        { id: 'mc_debruyne', name: 'Kevin De Bruyne', position: 'KP', age: 33, rating: 90, value: 70000000, nationality: 'be' },
        { id: 'mc_foden', name: 'Phil Foden', position: 'KP', age: 24, rating: 88, value: 130000000, nationality: 'gb-eng' },
        { id: 'mc_rodri', name: 'Rodri', position: 'KP', age: 28, rating: 89, value: 110000000, nationality: 'es' },
        { id: 'mc_dias', name: 'Rúben Dias', position: 'V', age: 27, rating: 88, value: 80000000, nationality: 'pt' },
        { id: 'mc_ederson', name: 'Ederson', position: 'K', age: 31, rating: 88, value: 40000000, nationality: 'br' },
        { id: 'mc_silva', name: 'Bernardo Silva', position: 'KP', age: 30, rating: 87, value: 75000000, nationality: 'pt' },
        { id: 'mc_grealish', name: 'Jack Grealish', position: 'CS', age: 29, rating: 85, value: 65000000, nationality: 'gb-eng' },
        { id: 'mc_walker', name: 'Kyle Walker', position: 'V', age: 34, rating: 84, value: 15000000, nationality: 'gb-eng' },
        { id: 'mc_stones', name: 'John Stones', position: 'V', age: 30, rating: 85, value: 40000000, nationality: 'gb-eng' },
        { id: 'mc_akanji', name: 'Manuel Akanji', position: 'V', age: 29, rating: 83, value: 42000000, nationality: 'ch' },
        { id: 'mc_alvarez', name: 'Julián Álvarez', position: 'CS', age: 24, rating: 84, value: 90000000, nationality: 'ar' },
        { id: 'mc_ortega', name: 'Stefan Ortega', position: 'K', age: 32, rating: 80, value: 9000000, nationality: 'de' },
        { id: 'mc_kovacic', name: 'Mateo Kovačić', position: 'KP', age: 30, rating: 82, value: 30000000, nationality: 'hr' },
        { id: 'mc_ake', name: 'Nathan Aké', position: 'V', age: 29, rating: 82, value: 40000000, nationality: 'nl' },
        { id: 'mc_doku', name: 'Jérémy Doku', position: 'CS', age: 22, rating: 81, value: 65000000, nationality: 'be' }
    ],
    "Liverpool": [
        { id: 'liv_salah', name: 'Mohamed Salah', position: 'CS', age: 32, rating: 90, value: 65000000, nationality: 'eg' },
        { id: 'liv_alisson', name: 'Alisson Becker', position: 'K', age: 32, rating: 89, value: 45000000, nationality: 'br' },
        { id: 'liv_vandijk', name: 'Virgil van Dijk', position: 'V', age: 33, rating: 88, value: 35000000, nationality: 'nl' },
        { id: 'liv_trent', name: 'T. Alexander-Arnold', position: 'V', age: 26, rating: 87, value: 70000000, nationality: 'gb-eng' },
        { id: 'liv_szoboszlai', name: 'Dominik Szoboszlai', position: 'KP', age: 24, rating: 85, value: 75000000, nationality: 'hu' },
        { id: 'liv_nunez', name: 'Darwin Núñez', position: 'CS', age: 25, rating: 84, value: 70000000, nationality: 'uy' },
        { id: 'liv_macallister', name: 'Alexis Mac Allister', position: 'KP', age: 26, rating: 85, value: 75000000, nationality: 'ar' },
        { id: 'liv_diaz', name: 'Luis Díaz', position: 'CS', age: 27, rating: 84, value: 75000000, nationality: 'co' },
        { id: 'liv_konate', name: 'Ibrahima Konaté', position: 'V', age: 25, rating: 83, value: 45000000, nationality: 'fr' },
        { id: 'liv_robertson', name: 'Andrew Robertson', position: 'V', age: 30, rating: 84, value: 40000000, nationality: 'gb-sct' },
        { id: 'liv_jota', name: 'Diogo Jota', position: 'CS', age: 28, rating: 84, value: 50000000, nationality: 'pt' },
        { id: 'liv_gakpo', name: 'Cody Gakpo', position: 'CS', age: 25, rating: 83, value: 50000000, nationality: 'nl' },
        { id: 'liv_gravenberch', name: 'Ryan Gravenberch', position: 'KP', age: 22, rating: 80, value: 35000000, nationality: 'nl' },
        { id: 'liv_endo', name: 'Wataru Endō', position: 'KP', age: 31, rating: 81, value: 13000000, nationality: 'jp' },
        { id: 'liv_gomez', name: 'Joe Gomez', position: 'V', age: 27, rating: 81, value: 28000000, nationality: 'gb-eng' },
        { id: 'liv_kelleher', name: 'Caoimhín Kelleher', position: 'K', age: 26, rating: 78, value: 18000000, nationality: 'ie' }
    ],
    "Arsenal": [
        { id: 'ars_saka', name: 'Bukayo Saka', position: 'CS', age: 23, rating: 88, value: 130000000, nationality: 'gb-eng' },
        { id: 'ars_odegaard', name: 'Martin Ødegaard', position: 'KP', age: 26, rating: 88, value: 110000000, nationality: 'no' },
        { id: 'ars_saliba', name: 'William Saliba', position: 'V', age: 23, rating: 87, value: 80000000, nationality: 'fr' },
        { id: 'ars_rice', name: 'Declan Rice', position: 'KP', age: 25, rating: 87, value: 110000000, nationality: 'gb-eng' },
        { id: 'ars_martinelli', name: 'Gabriel Martinelli', position: 'CS', age: 23, rating: 85, value: 85000000, nationality: 'br' },
        { id: 'ars_jesus', name: 'Gabriel Jesus', position: 'CS', age: 27, rating: 84, value: 70000000, nationality: 'br' },
        { id: 'ars_havertz', name: 'Kai Havertz', position: 'KP', age: 25, rating: 83, value: 60000000, nationality: 'de' },
        { id: 'ars_gabriel', name: 'Gabriel Magalhães', position: 'V', age: 27, rating: 84, value: 65000000, nationality: 'br' },
        { id: 'ars_white', name: 'Ben White', position: 'V', age: 27, rating: 83, value: 55000000, nationality: 'gb-eng' },
        { id: 'ars_ramsdale', name: 'Aaron Ramsdale', position: 'K', age: 26, rating: 82, value: 30000000, nationality: 'gb-eng' },
        { id: 'ars_trossard', name: 'Leandro Trossard', position: 'CS', age: 30, rating: 81, value: 35000000, nationality: 'be' },
        { id: 'ars_jorginho', name: 'Jorginho', position: 'KP', age: 33, rating: 81, value: 12000000, nationality: 'it' },
        { id: 'ars_zinchenko', name: 'Oleksandr Zinchenko', position: 'V', age: 28, rating: 80, value: 42000000, nationality: 'ua' },
        { id: 'ars_tomiyasu', name: 'Takehiro Tomiyasu', position: 'V', age: 26, rating: 80, value: 30000000, nationality: 'jp' },
        { id: 'ars_partey', name: 'Thomas Partey', position: 'KP', age: 31, rating: 83, value: 20000000, nationality: 'gh' },
        { id: 'ars_raya', name: 'David Raya', position: 'K', age: 29, rating: 83, value: 35000000, nationality: 'es' }
    ]
};

const NAMES = {
    'hu': {
        firstNames: ["Bence", "Máté", "Levente", "Dominik", "Ádám", "Dániel", "Zsombor", "Botond", "Milán", "László"],
        lastNames: ["Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár", "Németh", "Farkas"]
    },
    'en': {
        firstNames: ["Harry", "Oliver", "Jack", "George", "Noah", "Leo", "Charlie", "Jacob", "Freddie", "Alfie"],
        lastNames: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Roberts"]
    },
    'es': {
        firstNames: ["Hugo", "Mateo", "Martín", "Lucas", "Leo", "Daniel", "Alejandro", "Manuel", "Pablo", "Álvaro"],
        lastNames: ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martin"]
    },
    'de': {
        firstNames: ["Ben", "Paul", "Jonas", "Leon", "Finn", "Elias", "Maximilian", "Felix", "Noah", "Lukas"],
        lastNames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"]
    },
    'br': {
        firstNames: ["Miguel", "Arthur", "Gael", "Heitor", "Theo", "Davi", "Gabriel", "Bernardo", "Samuel", "João"],
        lastNames: ["da Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"]
    },
    'fr': {
        firstNames: ["Léo", "Gabriel", "Raphaël", "Arthur", "Louis", "Jules", "Adam", "Maël", "Lucas", "Hugo"],
        lastNames: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent"]
    },
    'it': {
        firstNames: ["Leonardo", "Francesco", "Alessandro", "Lorenzo", "Mattia", "Andrea", "Gabriele", "Tommaso", "Riccardo", "Edoardo"],
        lastNames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco"]
    }
};
