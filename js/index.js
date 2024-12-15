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
            const rows = data.split('\n');
            let result = rows.map(row => row.split('|'));

            result = shuffleArray(result);
            
            result.forEach(row => {
                const span = document.createElement('span');
                const link = document.createElement('a');
                span.appendChild(link);
                link.href = row[1];
                link.textContent = row[0];
                link.target = '_blank';
                m.appendChild(document.createTextNode('< '));
                m.appendChild(span);
                m.appendChild(document.createTextNode(' >...'));
            });
        });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}