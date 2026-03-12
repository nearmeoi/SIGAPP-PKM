
const map = L.map('map').setView([-5.132, 119.49], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const warungMakan = [
    {
        nama: "Warung Makan A",
        lat: -5.135,
        lng: 119.495,
        mokel: true
    },
    {
        nama: "Warung Makan B",
        lat: -5.130,
        lng: 119.485,
        mokel: false
    },
    {
        nama: "Warung Makan C",
        lat: -5.128,
        lng: 119.492,
        mokel: false
    }
];

const sidebar = document.getElementById('sidebar');

warungMakan.forEach(warung => {
    const marker = L.marker([warung.lat, warung.lng]).addTo(map);

    marker.on('click', () => {
        const dashboardContent = `
            <h2>${warung.nama}</h2>
            <p>${warung.mokel ? "Warung ini bisa menjadi tempat makan saat puasa." : "Warung ini tidak menyediakan tempat makan saat puasa."}</p>
        `;
        sidebar.innerHTML = dashboardContent;
    });
});
