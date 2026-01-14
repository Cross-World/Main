const ALL_QUIZZES = {
    animaky: {
        title: "Animované seriály",
        description: "Kvíz o legendárních seriálech jako Simpsonovi či Futurama.",
        icon: "🎬",
        questions: [
            { q: "Z jakého seriálu pochází sprejerský pseudonym 'El Barto'?", a: ["Simpsonovi", "Futurama", "Americký táta", "Piklírna"], correct: 0 },
            { q: "Jak se jmenuje pes v seriálu 'Family Guy'?", a: ["Brian", "Santa's Little Helper", "Snowball", "Scooby"], correct: 0 },
            { q: "Který seriál se odehrává v roce 3000?", a: ["Futurama", "Rick a Morty", "Jetsonovi", "Byl jednou jeden vesmír"], correct: 0 },
            { q: "Kdo je tvůrcem seriálu 'Simpsonovi'?", a: ["Matt Groening", "Seth MacFarlane", "Butch Hartman", "Stephen Hillenburg"], correct: 0 },
            { q: "Jak se jmenuje vědec v seriálu 'Rick a Morty'?", a: ["Rick Sanchez", "Hubert Farnsworth", "Dexter", "Jimmy Neutron"], correct: 0 },
            { q: "Který hrdina žije v ananasu pod mořem?", a: ["Spongebob v kalhotách", "Patrik Hvězdice", "Sépiák Chapadlo", "Garry"], correct: 0 },
            { q: "Jak se jmenuje fiktivní město v 'Simpsonových'?", a: ["Springfield", "Shelbyville", "Capital City", "Quahog"], correct: 0 },
            { q: "Který seriál sleduje osudy agentů v organizaci ISIS?", a: ["Archer", "Americký táta", "Simpsonovi", "F je pro rodinu"], correct: 0 },
            { q: "V kterém seriálu vystupuje postava jménem Eric Cartman?", a: ["South Park", "Simpsonovi", "Griffinovi", "Piklírna"], correct: 0 },
            { q: "Jak se jmenuje loď v seriálu 'Futurama'?", a: ["Planet Express Ship", "Enterprise", "Millennium Falcon", "Serenity"], correct: 0 },
            { q: "Jak se jmenuje nejlepší kamarád Spongeboba?", a: ["Patrik", "Sépiák", "Plankton", "Sandy"], correct: 0 },
            { q: "Jak se jmenuje hlavní postava v seriálu 'Pokémon'?", a: ["Ash Ketchum", "Gary", "Brock", "Misty"], correct: 0 },
            { q: "Který seriál se zaměřuje na postavu jménem Homer?", a: ["Simpsonovi", "Americký táta", "Griffinovi", "Futurama"], correct: 0 },
            { q: "Jak se jmenuje otec v seriálu 'Griffinovi'?", a: ["Peter Griffin", "Homer Simpson", "Stan Smith", "Cleveland Brown"], correct: 0 },
            { q: "Pro koho pracuje 'Stan Smith' ze seriálu 'Americký táta'?", a: ["CIA", "FBI", "Tajnou vládu", "Mimozemštany"], correct: 0 },
           
        ]
        },
    stargate: {
        title: "Hvězdná brána",
        description: "Prověř své znalosti o SG-1, Atlantis, Universe a původním filmu.",
        icon: "🌌",
        questions: [
            { q: "Jak se jmenuje kov, ze kterého je vyrobena Hvězdná brána?", a: ["Naquadah", "Trinium", "Neutronium", "Adamantium"], correct: 0 },
            { q: "Kolik symbolů (zadaných adres) je potřeba pro cestu do jiné galaxie?", a: ["8", "7", "9", "6"], correct: 0 },
            { q: "Jak se jmenuje domovská planeta Asgardů?", a: ["Othala", "Chulak", "Abydos", "Dakara"], correct: 0 },
            { q: "Kdo vyřešil matematický problém s energií pro vytočení devátého symbolu?", a: ["Eli Wallace", "Nicholas Rush", "Samantha Carter", "Rodney McKay"], correct: 0 },
            { q: "Která rasa stvořila Hvězdné brány?", a: ["Antikové", "Asgardi", "Noxové", "Furlingové"], correct: 0 },
            { q: "Jak se jmenuje parazitická rasa, která ovládá hostitele?", a: ["Goa'uld", "Wraith", "Replikátor", "Ori"], correct: 0 },
            { q: "V jakém pohoří se nachází základna SGC?", a: ["Cheyenne Mountain", "Mount Everest", "Sierra Nevada", "Rocky Mountains"], correct: 0 },
            { q: "Jak se jmenuje loď, na které se odehrává seriál Stargate Universe?", a: ["Destiny", "Daedalus", "Prometheus", "Odyssey"], correct: 0 },
            { q: "Kdo byl původně prvním mužem Apophise, než se přidal k SG-1?", a: ["Teal'c", "Bra'tac", "Ronon Dex", "Vala Mal Doran"], correct: 0 },
            { q: "Jak se jmenuje hlavní nepřátelská rasa v seriálu Stargate Atlantis?", a: ["Wraithové", "Asurané", "Geniiové", "Kull bojovníci"], correct: 0 },
            { q: "Který herec ztvárnil Jacka O'Neilla v seriálu SG-1?", a: ["Richard Dean Anderson", "Kurt Russell", "Michael Shanks", "Ben Browder"], correct: 0 },
            { q: "Jak se jmenuje Danielova manželka z planety Abydos?", a: ["Sha're", "Vala", "Ishta", "Osiris"], correct: 0 },
            { q: "Který systémový lord byl v seriálu SG-1 nejdéle hlavním nepřítelem?", a: ["Ba'al", "Anubis", "Apophis", "Ra"], correct: 0 },
            { q: "Co znamená zkratka ZPM?", a: ["Zero Point Module", "Zat'nik'tel Power Mode", "Zone Protection Module", "Z-energy Pulse Maker"], correct: 0 },
            { q: "Jakou přezdívku má zbraň 'Zat'nik'tel'?", a: ["Zat", "Tyčová zbraň", "Dron", "P-90"], correct: 0 }
        ]
    }
};