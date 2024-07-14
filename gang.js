


const firebaseConfig = {
    apiKey: "AIzaSyD15fcsNbd3jvBKwfkTQ5TKWbr4regZnFI",
    authDomain: "facemash-e2040.firebaseapp.com",
    projectId: "facemash-e2040",
    storageBucket: "facemash-e2040.appspot.com",
    messagingSenderId: "345213116248",
    appId: "1:345213116248:web:0b962714a47a48b6f30f2d",
    measurementId: "G-SGQ3V2PQTH"
};



let images = [
    { "src": "image1.jpg", "elo": 1000 },
    { "src": "image2.jpg", "elo": 1000 },
    { "src": "image3.jpg", "elo": 1000 },
    { "src": "image4.jpg", "elo": 1000 },
    { "src": "image5.jpg", "elo": 1000 },
    { "src": "image6.jpg", "elo": 1000 },
    { "src": "image7.jpg", "elo": 1000 },
    { "src": "image8.jpg", "elo": 1000 }
];

function loadImages() {
    const storedImages = JSON.parse(localStorage.getItem('images'));
    if (storedImages) {
        images = storedImages;
    }
}

function saveImages() {
    localStorage.setItem('images', JSON.stringify(images));
}

window.startTournament = function() {
    window.location.href = "tournament.html";
}

window.viewRankings = function() {
    window.location.href = "rankings.html";
}

window.goBack = function() {
    window.location.href = "index.html";
}

window.chooseWinner = function(winnerIndex) {
    let image1 = document.getElementById('image1').src;
    let image2 = document.getElementById('image2').src;
    let winner = winnerIndex === 1 ? image1 : image2;
    let loser = winnerIndex === 1 ? image2 : image1;
    updateElo(winner, loser);
}

function updateElo(winner, loser) {
    let winnerFileName = winner.split('/').pop();
    let loserFileName = loser.split('/').pop();

    let winnerData = images.find(image => image.src === winnerFileName);
    let loserData = images.find(image => image.src === loserFileName);

    if (!winnerData || !loserData) {
        console.error('Image data not found for winner or loser.');
        return;
    }

    let expectedWinner = 1 / (1 + Math.pow(10, (loserData.elo - winnerData.elo) / 400));
    let expectedLoser = 1 / (1 + Math.pow(10, (winnerData.elo - loserData.elo) / 400));

    winnerData.elo = Math.round(winnerData.elo + 32 * (1 - expectedWinner));
    loserData.elo = Math.round(loserData.elo + 32 * (0 - expectedLoser));

    saveImages();
    saveScoresToFirebase();
    loadNewImages();
}

function loadNewImages() {
    let [img1, img2] = getRandomImages();
    document.getElementById('image1').src = img1.src;
    document.getElementById('image2').src = img2.src;
}

function getRandomImages() {
    let shuffled = images.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
}

window.displayRankings = function() {
    let rankingsTable = document.getElementById('rankings-table').getElementsByTagName('tbody')[0];
    rankingsTable.innerHTML = '';

    images.sort((a, b) => b.elo - a.elo);

    images.forEach((image, index) => {
        let row = rankingsTable.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);

        cell1.innerHTML = index + 1;
        cell2.innerHTML = `<img src="${image.src}" width="50">`;
        cell3.innerHTML = image.elo;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    loadScoresFromFirebase();
    if (document.getElementById('rankings-table')) {
        displayRankings();
    }
    if (document.getElementById('image1') && document.getElementById('image2')) {
        loadNewImages();
    }
});

async function saveScoresToFirebase() {
    const imgCollection = collection(db, 'images');
    images.forEach(async (image) => {
        const imgDoc = doc(imgCollection, image.src);
        await setDoc(imgDoc, image)
        .then(() => {
            console.log('Document successfully written!');
        })
        .catch((error) => {
            console.error('Error writing document: ', error);
        });
    });
}

async function loadScoresFromFirebase() {
    const imgCollection = collection(db, 'images');
    const querySnapshot = await getDocs(imgCollection);
    querySnapshot.forEach((doc) => {
        let image = images.find(img => img.src === doc.id);
        if (image) {
            image.elo = doc.data().elo;
        }
    });
    console.log('Scores loaded from Firebase:', images);
    saveImages();
}
