document.addEventListener('DOMContentLoaded', function () {
    setCopyrightYear();
    initMarquee();
});

function setCopyrightYear() {
    const year = new Date().getFullYear();
    document.querySelector('.copyright-year').textContent = year;
}

function initMarquee() {
    const marquee = document.getElementById('marquee');
    const marqueeContent = marquee.querySelector('.marquee-content');

    // load marquee data
    fetch('data/tech_list.csv')
        .then(response => response.text())
        .then(data => {
            const frag = document.createDocumentFragment();

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
                link.href = row[1].trim();
                link.textContent = row[0].trim();
                link.target = '_blank';

                frag.appendChild(document.createTextNode('|'));
                frag.appendChild(span);
                frag.appendChild(document.createTextNode('|···'));
            });

            const pacman = document.createElement('span');
            pacman.className = "pacman";

            const pacmanimg = document.createElement('img');
            pacman.appendChild(pacmanimg);
            pacmanimg.src = "img/pac-man.gif";

            frag.appendChild(pacman);

            marqueeContent.append(frag);
        });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}