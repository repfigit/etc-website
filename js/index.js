document.addEventListener('DOMContentLoaded', function () {
    setCopyrightYear();
    loadEmergingTechList();
});

function setCopyrightYear() {
    const year = new Date().getFullYear();
    document.querySelector('.copyright-year').textContent = year;
}

function loadEmergingTechList() {
    const m = document.querySelector('marquee#tech-list');
    
    fetch('data/tech_list.csv')
        .then(response => response.text())
        .then(data => {
            const frag = document.createDocumentFragment();

            const pacman = document.createElement('span');
            frag.appendChild(pacman);
            pacman.className="pacman";

            const pacmanimg = document.createElement('img');
            pacman.appendChild(pacmanimg);
            pacmanimg.src = "img/pac-man.gif";

            // parse and shuffle tech list data
            const rows = data.split('\n');
            let result = rows.map(row => row.split('|'));
            result = shuffleArray(result);

            const lead = document.createElement('span');
            lead.innerHTML = '<strong>Emerging Technologies:</strong> |···';
            frag.appendChild(lead);
            
            result.forEach(row => {
                const span = document.createElement('span');
                const link = document.createElement('a');
                span.appendChild(link);
                link.href = row[1];
                link.textContent = row[0];
                link.target = '_blank';

                frag.appendChild(document.createTextNode('| '));
                frag.appendChild(span);
                frag.appendChild(document.createTextNode(' |···'));
            });

            const mspackman = pacman.cloneNode(true);
            mspackman.querySelector('img').src = "/img/ms-pac-man.gif";
            frag.appendChild(mspackman);

            m.append(frag);
        });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}