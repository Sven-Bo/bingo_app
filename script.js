document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bingoEntriesTextarea = document.getElementById('bingoEntries');
    const gridSizeSelect = document.getElementById('gridSize');
    const freeSpaceCheckbox = document.getElementById('freeSpace');
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const newBoardBtn = document.getElementById('newBoardBtn');
    const shareBtn = document.getElementById('shareBtn');
    const bingoBoard = document.getElementById('bingoBoard');
    
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Sample entries for initial load
    const sampleEntries = [
        "Hat sich verlaufen",
        "Postet Sonnenuntergang",
        "Beschwert sich über Touristen",
        "'Authentisches' Erlebnis",
        "Isst 'lokale Spezialität'",
        "Lernt drei Wörter der Landessprache",
        "Postet Essen-Foto",
        "Verpasst den Bus/Zug/Flug",
        "Verliert etwas Wichtiges",
        "Trifft 'locals' die jetzt 'beste Freunde' sind",
        "Besucht 'versteckten Geheimtipp'",
        "Postet Bild von Cocktail am Strand",
        "Behauptet, die Kultur 'wirklich zu verstehen'",
        "Findet alles 'so anders als zu Hause'",
        "Beschwert sich über Preise",
        "Bekommt Sonnenbrand",
        "Kauft nutzloses Souvenir",
        "Behauptet, 'wie ein Einheimischer' zu leben",
        "Postet philosophischen Spruch über Reisen",
        "Hat Magen-Darm-Probleme",
        "Besucht überteuerte Touristenfalle",
        "Behauptet, 'verändert' zurückzukommen",
        "Trägt lokale Kleidung unangemessen",
        "Macht peinliches Foto vor Sehenswürdigkeit",
        "Vergleicht alles mit Deutschland"
    ];
    
    bingoEntriesTextarea.value = sampleEntries.join('\n');
    
    // Event Listeners
    generateBtn.addEventListener('click', generateBingoBoard);
    printBtn.addEventListener('click', () => window.print());
    newBoardBtn.addEventListener('click', generateBingoBoard);
    
    // Share functionality for mobile
    if (shareBtn) {
        if (navigator.share) {
            shareBtn.addEventListener('click', shareBingoBoard);
        } else {
            shareBtn.style.display = 'none';
        }
    }
    
    // Make cells markable with better touch support
    bingoBoard.addEventListener('click', (e) => {
        if (e.target.classList.contains('bingo-cell') && !e.target.classList.contains('free-space')) {
            e.target.classList.toggle('marked');
        }
    });
    
    // Add touch events for mobile
    if (isMobile) {
        // Prevent zooming when tapping inputs on mobile
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.target.addEventListener('touchend', function(e) {
                    e.preventDefault();
                }, { once: true });
            }
        }, false);
        
        // Handle orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                // Re-adjust font size after orientation change
                const gridSize = parseInt(gridSizeSelect.value);
                adjustCellFontSize(gridSize);
            }, 300);
        });
        
        // Listen for grid size changes and update UI accordingly
        gridSizeSelect.addEventListener('change', function() {
            // If on small mobile and user selects 5x5, show warning
            if (window.innerWidth < 360 && this.value === '5') {
                alert('Hinweis: 5x5 kann auf kleinen Bildschirmen schwer lesbar sein. Drehe dein Gerät ins Querformat für bessere Ansicht.');
            }
        });
    }
    
    // Set default grid size based on screen width
    if (isMobile && window.innerWidth < 480) {
        // Default to 3x3 on small mobile devices
        gridSizeSelect.value = '3';
    }
    
    // Generate initial board
    generateBingoBoard();
    
    // Main function to generate the bingo board
    function generateBingoBoard() {
        // Get values from inputs
        const entriesText = bingoEntriesTextarea.value.trim();
        const gridSize = parseInt(gridSizeSelect.value);
        const useFreeSpace = freeSpaceCheckbox.checked;
        
        // Parse entries
        let entries = entriesText.split('\n')
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
        
        // Calculate required entries
        const totalCells = gridSize * gridSize;
        const requiredEntries = useFreeSpace ? totalCells - 1 : totalCells;
        
        // Check if we have enough entries
        if (entries.length < requiredEntries) {
            alert(`Du brauchst mindestens ${requiredEntries} Einträge für ein ${gridSize}x${gridSize} Bingo-Board${useFreeSpace ? ' mit freiem Feld' : ''}.`);
            return;
        }
        
        // Shuffle entries
        entries = shuffleArray(entries).slice(0, requiredEntries);
        
        // Create bingo board
        bingoBoard.innerHTML = '';
        bingoBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // Remove any previous size classes
        bingoBoard.classList.remove('size-3', 'size-4', 'size-5');
        // Add current size class
        bingoBoard.classList.add(`size-${gridSize}`);
        
        // Calculate center position for free space
        const centerPos = useFreeSpace ? Math.floor(totalCells / 2) : -1;
        
        // Add cells to the board
        let entryIndex = 0;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            
            // Truncate very long text on mobile
            let cellText = entries[entryIndex];
            if (isMobile && cellText && cellText.length > 30) {
                cellText = cellText.substring(0, 27) + '...';
            }
            
            if (useFreeSpace && i === centerPos) {
                cell.textContent = 'FREI';
                cell.classList.add('free-space');
            } else {
                cell.textContent = cellText || entries[entryIndex];
                entryIndex++;
            }
            
            bingoBoard.appendChild(cell);
        }
        
        // Adjust font size based on grid size and screen size
        adjustCellFontSize(gridSize);
    }
    
    // Function to adjust cell font size based on grid size and screen width
    function adjustCellFontSize(gridSize) {
        const cells = document.querySelectorAll('.bingo-cell');
        const baseFontSize = isMobile ? 12 : 14;
        
        // Adjust font size based on grid size
        let fontSize = baseFontSize;
        if (gridSize === 4) {
            fontSize = isMobile ? 10 : 13;
        } else if (gridSize === 5) {
            fontSize = isMobile ? 9 : 12;
        }
        
        // Further reduce for very small screens
        if (window.innerWidth < 360 && gridSize > 3) {
            fontSize -= 2;
        }
        
        // Apply font size to all cells
        cells.forEach(cell => {
            cell.style.fontSize = `${fontSize}px`;
        });
    }
    
    // Function to share bingo board (for mobile)
    function shareBingoBoard() {
        // Get the current entries
        const entriesText = bingoEntriesTextarea.value.trim();
        const entries = entriesText.split('\n')
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
            
        // Create share text
        const shareTitle = 'Reise Bingo';
        const shareText = 'Schau dir mein Reise Bingo an!\n\nEinträge:\n' + entries.slice(0, 5).join('\n') + 
                        (entries.length > 5 ? '\n...' : '');
        
        // Share the bingo board
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.error('Fehler beim Teilen:', err);
        });
    }
    
    // Utility function to shuffle array
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
});
