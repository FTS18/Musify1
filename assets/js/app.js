//on double tap open music player full-screen
const musicPlayerSection = document.querySelector('.player');
const playlistSection = document.querySelector('.playlists');
const playlistBtn = document.querySelector('.playlist-btn');
const backToHomeBtn = document.querySelector('.back-btn');
const toggle = document.querySelector('.toggle');
const menuBtn = document.querySelector('.menuBtn');
const body = document.querySelector('body');
const content = document.querySelector('.content');
const menu = document.querySelector('.menu');

// Playlist queue
const queue = [];

// Playlists initialization function
function initializeQueue() {
    queue.forEach((item, i) => {
        item.addEventListener('click', () => {
            setMusic(i);
            playBtn.click();
        });
    });
}

// Toggle menu
toggle.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    menu.classList.toggle('active');
    content.classList.toggle('disabledScroll');
    body.classList.toggle('disabledScroll');
});

// Open music player section
musicPlayerSection.addEventListener('click', () => {
    musicPlayerSection.classList.add('active');
    backToHomeBtn.classList.add('active');
    playlistSection.classList.add('active1');
    body.classList.add('disabledScroll');
    backToHomeBtn.classList.add('active');
});

// Going back
backToHomeBtn.addEventListener('click', () => {
    musicPlayerSection.classList.remove('active');
    playlistSection.classList.remove('active1');
    console.log('Back Key Pressed');
    body.classList.remove('disabledScroll');
    backToHomeBtn.classList.remove('active');
});

// Access playlist
playlistBtn.addEventListener('click', () => {
    playlistSection.classList.add('active');
    playlistSection.classList.add('active1');
});

// Function to open playlist
function openPlaylist() {
    musicPlayerSection.classList.add('active');
    playlistSection.classList.add('active');
    backToHomeBtn.classList.add('active');
    playlistBtn.click();
}

// Back to media player from playlists
const backToMusicPlayerBtn = document.querySelector('.playlists .back-btn1');
backToMusicPlayerBtn.addEventListener('click', () => {
    playlistSection.classList.remove('active');
});

// Music player elements
let currentMusic = 0;
const music = document.querySelector('#audio-source');
const seekBar = document.querySelector('.music-seek-bar');
const songName = document.querySelector('.current-song-name');
const artistName = document.querySelector('.artist-name');
const coverImage = document.querySelector('.cover');
const currentTime = document.querySelector('.current-time');
const musicDuration = document.querySelector('.duration');
const forwardBtn = document.querySelector('.main-controls i#next');
const backwardBtn = document.querySelector('.main-controls i#prev');
const playBtn = document.querySelector('.main-controls i.play');
const pauseBtn = document.querySelector('.main-controls i.pause');
const repeatBtn = document.querySelector('span i#repeat');
const volumeBtn = document.querySelector('#up.active');
const volumeSlider = document.querySelector('.volume-slider');
const controlsArea = document.querySelector('.controls');
const volumeContainer = document.querySelector('.controls .volume-container');

// Play
playBtn.addEventListener('click', () => {
    music.play();
    music.playbackRate = 1.05;
    playBtn.classList.remove('active');
    pauseBtn.classList.add('active');
});

// Pause
pauseBtn.addEventListener('click', () => {
    music.pause();
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
});
function setMusic(i) {
    seekBar.value = 0;
    let song = songs[i];
    currentMusic = i;
    music.src = `assets/songs/${song.path}.mp3`;
    songName.innerText = song.name;
    artistName.innerText = song.artist;
    coverImage.src = `assets/images/cover/${song.cover}.jpg`;

    // Set up event listener for canplaythrough
    music.addEventListener('canplaythrough', function () {
        seekBar.max = music.duration;
        musicDuration.innerHTML = formatTime(music.duration);

        // Play the music when it's ready
        music.play();
        playBtn.classList.remove('active');
        pauseBtn.classList.add('active');
    }, { once: true });

    // Handle the case where canplaythrough may not be fired
    let canPlay = false;
    music.addEventListener('playing', function () {
        canPlay = true;
    });

    // Set up a timeout to check and play if canplaythrough is not fired
    setTimeout(function () {
        if (!canPlay) {
            music.play();
            playBtn.classList.remove('active');
            pauseBtn.classList.add('active');
        }
    }, 1000);

    queue.forEach(item => item.classList.remove('active'));
    queue[currentMusic].classList.add('active');
    const currentSong = songs[currentMusic];
    document.title = `${currentSong.name} - ${currentSong.artist} | Radioo`;
} 
const initialSong = songs[0]; document.querySelector('.current-song-name').innerText = initialSong.name;
document.querySelector('.artist-name').innerText = initialSong.artist;
document.querySelector('.cover').src = `assets/images/cover/${initialSong.cover}.webp`;
document.querySelector('.cover').alt = initialSong.name;
music.src = `assets/songs/${initialSong.path}.mp3`;

// Function to show a notification
function showNotification(song) {
    if (Notification.permission === 'granted') {
        const notification = new Notification('Now Playing', {
            body: `${song.name} - ${song.artist}`,
            icon: `assets/images/cover/${song.cover}.jpg`
        });

        // Close the notification after a few seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(song);
            }
        });
    }
}
// Play button click event
playBtn.addEventListener('click', () => {
    music.play();
    music.playbackRate = 1.00;
    playBtn.classList.remove('active');
    pauseBtn.classList.add('active');

    // Update window title and show notification
    const currentSong = songs[currentMusic];
    showNotification(currentSong);
    document.title = `${currentSong.name} - ${currentSong.artist} | Radioo`;
});

// Pause button click event
pauseBtn.addEventListener('click', () => {
    music.pause();
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
});
// Getting duration from song
function formatTime(time) {
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    if (sec < 10) {
        sec = `0` + sec;
    }
    return `${min} : ${sec}`;
}

function formatCurrentTime(time) {
    let curmin = Math.floor(time / 60);
    let cursec = Math.floor(time % 60);
    if (cursec < 10) {
        cursec = `0` + cursec;
    }
    return `${curmin} : ${cursec}`;
}

// Update seek bar and current time on timeupdate
music.addEventListener('timeupdate', () => {
    seekBar.value = music.currentTime;
    currentTime.innerText = formatCurrentTime(music.currentTime);
});

// Seekbar events
seekBar.addEventListener('input', () => {
    const seekTime = seekBar.value;
    music.currentTime = seekTime;
    currentTime.innerText = formatCurrentTime(seekTime);
});

// Seekbar update on mousedown and mouseup
seekBar.addEventListener('mousedown', () => {
    music.pause(); // Pause music while seeking
});

seekBar.addEventListener('mouseup', () => {
    music.play(); // Resume music after seeking
});

// Next and Backward buttons
function nextSong() {
    if (currentMusic >= songs.length - 1) {
        currentMusic = 0;
    } else {
        currentMusic++;
    }
    setMusic(currentMusic);
    playBtn.click();
}
function shuffle() {
    shuffleArray(songs);
    setMusic(0); // Start playing from the first song after shuffling
}

repeatBtn.addEventListener('click', () => {
    switch (repeatBtn.innerText) {
        case 'repeat':
            repeatBtn.innerText = 'repeat_one';
            repeatBtn.setAttribute('title', 'Song looped');
            break;
        case 'repeat_one':
            repeatBtn.innerText = 'shuffle';
            repeatBtn.setAttribute('title', 'Playback Shuffled');
            break;
        case 'shuffle':
            repeatBtn.innerText = 'repeat';
            repeatBtn.setAttribute('title', 'Playlist looped');
            break;
    }
});

// Music Ended Event
music.addEventListener('ended', () => {
    switch (repeatBtn.innerText) {
        case 'repeat':
            nextSong();
            break;
        case 'repeat_one':
            setMusic(currentMusic);
            playBtn.click();
            repeatSong();
            break;
        case 'shuffle':
            shuffle(); // Move to the next shuffled song
            break;
    }
});
function repeatSong() {
    if (Math.floor(music.currentTime) == Math.floor(seekBar.max)) {
        if (repeatBtn.className.includes('active')) {
            setMusic(currentMusic);
            playBtn.click();
        } else {
            forwardBtn.click();
        }
    }
}// Assuming you have an image element with id "coverImage"
const coverImage1 = document.getElementById('cover');

// Function to update player background with blurred cover image
function updatePlayerBackgroundColor() {
    // Assuming you have a player div with the class "player"
    const playerDiv = document.querySelector('.player.active'); // Replace with the actual selector for your player div

    // Set background with blurred cover image
    playerDiv.style.background = `
        linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)),
        url(${coverImage.src}) center/cover no-repeat fixed`;
    playerDiv.style.backdropFilter = 'blur(120px)';
}

forwardBtn.addEventListener('click', () => {
    currentMusic = (currentMusic + 1) % songs.length;
    setMusic(currentMusic);
    playBtn.click();
});

backwardBtn.addEventListener('click', () => {
    currentMusic = (currentMusic - 1 + songs.length) % songs.length;
    setMusic(currentMusic);
    playBtn.click();
});

// Ensure cover image is loaded before updating the player background
coverImage1.onload = function () {
    updatePlayerBackgroundColor();
};

// Optionally, you can also update the player background when the cover image fails to load
coverImage1.onerror = function () {
    updatePlayerBackgroundColor();
};

// Volume Button
volumeBtn.addEventListener('click', () => {
    volumeBtn.classList.remove('active');
    volumeSlider.classList.add('active');
    volumeContainer.classList.add('active');
});

volumeSlider.addEventListener('change', () => {
    setInterval(function () {
        volumeBtn.classList.add('active');
        volumeSlider.classList.remove('active');
        volumeContainer.classList.remove('active');
    }, 3900);
});

volumeSlider.addEventListener('input', () => {
    music.volume = volumeSlider.value;
});

fetch('assets/js/playlist_data.json')
    .then(response => response.json())
    .then(data => {
        // Generate HTML for playlists
        const playlistsContainer = document.getElementById('playlists');
        data.playlists.forEach(playlist => {
            const playlistItem = document.createElement('a');
            playlistItem.classList.add('card', playlist.id, 'playlist');
            playlistItem.href = '#';
            playlistItem.innerHTML = `
                    <img class="imgBx lazyload" data-src="${playlist.imageSrc}" title="${playlist.title}">
                    <div class="overlayImg"></div>
                    <div class="para ${playlist.id}">${playlist.title}</div>
                `;
            playlistsContainer.appendChild(playlistItem);

            // Add the playlist item to the queue
            queue.push(playlistItem);
        });

        // Generate HTML for artists
        const artistsContainer = document.getElementById('artists');
        data.artists.forEach(artist => {
            const artistItem = document.createElement('a');
            artistItem.classList.add('card', artist.id, 'playlist');
            artistItem.href = '#';
            artistItem.innerHTML = `
                    <img class="imgBx lazyload" data-src="${artist.imageSrc}" title="${artist.title}">
                    <div class="overlayImg"></div>
                    <div class="para ${artist.id}">${artist.title}</div>
                `;
            artistsContainer.appendChild(artistItem);

            // Add the artist item to the queue
            queue.push(artistItem);
        });

        // After populating the playlists, initialize the queue
        initializeQueue();
    })
    .catch(error => console.error('Error loading playlist data:', error));

const queueContainer = document.getElementById('queue');
const loadMoreButton = document.getElementById('loadMoreButton');
const itemsPerPage = 20; // Adjust the number of items per page as needed
let currentPage = 1;
function loadItems(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = songs.slice(startIndex, endIndex);

    itemsToShow.forEach((item, index) => {
        const itemHTML = `
            <div class="queue" data-index="${startIndex + index}">
                <a href="javascript:void(0);" onclick="playSong(${startIndex + index})">
                    <div class="queue-cover">
                        <img class="lazyload" data-src="assets/images/cover/${item.cover}.jpg" alt="${item.name}">
                        <i class="fas fa-pause" title="Playing Now"></i>
                    </div>
                    </a>
                    <a href="javascript:void(0);" onclick="playSong(${startIndex + index})">
                    <p class="song-name" >${item.name}</p>
                    </a>
            </div>
        `;
        queueContainer.innerHTML += itemHTML;
    });
}
function playSong(index) {
    setMusic(index);
    playBtn.click();
}

function handleLoadMore() {
    currentPage++;
    loadItems(currentPage);
}

// Load initial items
loadItems(currentPage);

// Attach event listener to the "Load More" button
loadMoreButton.addEventListener('click', handleLoadMore);
// With event delegation: 
document.getElementById('queueContainer').addEventListener('click', (event) => {
    const targetQueue = event.target.closest('.queue');
    if (targetQueue) {
        const index = parseInt(targetQueue.dataset.index);
        playSong(index);

        // Toggle play/pause symbol
        queue.forEach((item, i) => {
            const pauseIcon = item.querySelector('.fa-pause');
            pauseIcon.classList.toggle('active', i === index);
        });
    }
}); document.addEventListener('keydown', function (event) {
    if (event.ctrlKey) {
        // Ctrl key is pressed
        switch (event.key) {
            case 'ArrowLeft':
                // Handle Ctrl + Left Arrow (previous song)
                backwardBtn.click(); // Trigger the action for previous song
                break;
            case 'ArrowRight':
                // Handle Ctrl + Right Arrow (next song)
                forwardBtn.click(); // Trigger the action for next song
                break;
        }
    } else {
        // Ctrl key is not pressed
        switch (event.key) {
            case ' ':
                // Handle Spacebar (play/pause)
                event.preventDefault();
                playPauseToggle(); // Implement your play/pause toggle logic
                break;
            case 'F4':
                // Handle F4 key (previous song)
                event.preventDefault();
                backwardBtn.click(); // Trigger the action for previous song
                break;
            case 'F5':
                // Handle F5 key (play/pause)
                event.preventDefault();
                playPauseToggle(); // Implement your play/pause toggle logic
                break;
            case 'F6':
                // Handle F6 key (next song)
                event.preventDefault();
                forwardBtn.click(); // Trigger the action for next song
                break;
        }
    }
});

// Play/pause toggle function
function playPauseToggle() {
    if (music.paused) {
        playBtn.click();
    } else {
        pauseBtn.click();
    }
}

/*
const search = () => {
    const searchBox = document.querySelector(".input").value.toUpperCase();
    const storeItems = document.querySelector('.grid-container');
    const item = document.querySelectorAll('.card');
    const pname = storeItems.getElementsByTagName("h3");
    for (var i = 0; i < pname.length; i++) {
        let match = item[i].getElementsByTagName("h3")[0];
        if (match) {
            let textValue = match.textContent || match.innerHTML;
            if (textValue.toUpperCase().indexOf(searchBox) > -1 & textValue.toUpperCase().indexOf(searchBox1) > -1) {
                item[i].style.display = "";
                console.log("item[i]")
            } else {
                item[i].style.display = "none";
            }
        }
    }
}*/

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Shuffle Button
shuffleBtn.addEventListener('click', () => {
    shuffleArray(songs);
    if (repeatBtn.innerText === 'shuffle') {
        setMusic(0); // Start playing from the first song after shuffling
    }
});

// Repeat Button
repeatBtn.addEventListener('click', () => {
    let getText = repeatBtn.innerText;
    switch (getText) {
        case 'repeat':
            repeatBtn.innerText = 'repeat_one';
            repeatBtn.setAttribute('title', 'Song looped');
            break;
        case 'repeat_one':
            repeatBtn.innerText = 'shuffle';
            repeatBtn.setAttribute('title', 'Playback Shuffled');
            break;
        case 'shuffle':
            repeatBtn.innerText = 'repeat';
            repeatBtn.setAttribute('title', 'Playlist looped');
            break;
    }
});

music.addEventListener('ended', () => {
    let getText = repeatBtn.innerText;
    switch (getText) {
        case 'repeat':
            nextSong();
            break;
        case 'repeat_one':
            setMusic(currentMusic);
            playBtn.click();
            repeatSong();
            break;
        case 'shuffle':
            nextSong(); // Move to the next shuffled song
            break;
    }
});