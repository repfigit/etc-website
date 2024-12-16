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
            // parse and shuffle tech list data
            const rows = data.split('\n');
            let result = rows.map(row => row.split('|'));
            result = shuffleArray(result);

            let frag = document.createDocumentFragment();

            let lead = document.createElement('span');
            lead.innerHTML = '<strong>Emerging Technologies:</strong> |···';
            frag.appendChild(lead);
            
            result.forEach(row => {
                const span = document.createElement('span');
                const link = document.createElement('a');
                link.href = row[1];
                link.textContent = row[0];
                link.target = '_blank';
                span.appendChild(link);

                frag.appendChild(document.createTextNode('| '));
                frag.appendChild(span);
                frag.appendChild(document.createTextNode(' |···'));
            });

            let pacman = document.createElement('img');
            pacman.className="pacman";
            pacman.src = "img/pac-man-fortnite.gif";

            frag.appendChild(pacman);

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