	//initialize tbl variable and localStorage
	var tbl = document.getElementById("sud");
	localStorage.setItem("numpos", null);
	localStorage.setItem("cardnum", null);
	
	// create/display main table (board)
	function showBoard(){
		
		// size of board based on columns
		var cols = localStorage.getItem("cols");
		if (cols==null) {
			var cols = 4;
			localStorage.setItem("cols", cols);
		}
		document.getElementById("size").value = cols;
		
		//responsive for mobile phone (vertical for 4x5 and 4x6 instead of horizontal)
		let windowpx = window.outerWidth;	
		if (windowpx < 800) {
			var rows = cols;
			var cols = 4;
		} else {
			var rows = 4;
		}
		
		//add cards to the table
		let arr = arrangeCards(cols * rows);
		var i = 0;
		for (var r = 0; r < rows; r++){    
			var row = tbl.insertRow(tbl.rows.length);
			for (var c = 0; c < cols; c++){
				var cell = row.insertCell(c);
				var card = arr[i];
				var w = 110;
				var h = 110;			
				cell.style="width:" + w + "px;" + " height:" + h + "px;";
				var img = "LaLiga/" + card + ".png"
				cell.innerHTML = 
				'<div class="flip-box">' +
					'<div class="flip-box-inner">' +
						'<div class="flip-box-front" onclick="clickCard(this)" ondblclick="preventDblclick(this)">' +
						'</div>' +
						'<div class="flip-box-back">' +
							'<img src=' + img + '>' + 
						'</div>' +
					'</div>' +
				'</div>';
				i++;
			}
		}
	}

	function getcols() {
		let sizetxt = document.getElementById("size").value;
		let sizecols = sizetxt.substring(sizetxt.length - 2);
		let cols = sizecols.replace(")","");
		return cols;  // 4,5,6
	}
	
	function changeSize() {
		let cols = getcols();
		localStorage.setItem("cols", cols);
		reload();
	}
	
	function reload() {
		window.location.reload();
	}

	function preventDblclick(el) {
		el.parentNode.style='transform: rotateY(360deg);';
		localStorage.setItem("numpos", null);
		localStorage.setItem("cardnum", null);
	}
	
	function clickCard(el) {
		
		//get card number
		var cardSrc = el.nextSibling.childNodes[0].src;
		var cardSrcSplit = cardSrc.split("/");
		var cardSplitLast = cardSrcSplit[cardSrcSplit.length-1];
		var cardNumberCut = cardSplitLast.replace(".png", "");
		var cardNumber = parseInt(cardNumberCut);
		
		//get previous card number 
		var prevCard = localStorage.getItem("cardnum");
		
		// check if first or second card
		if (prevCard == 'null') { //first card ----------
			el.parentNode.style='transform: rotateY(180deg);';	//flip card
			var cell = el.parentNode.parentNode;  
			setPos(cell, cardNumber);	// save position and card number to localstorage
			let moves = parseInt(document.getElementById("moves").innerText);
			document.getElementById("moves").innerText = moves + 1;   //update moves
		} else { // second card --------------------------
			
			var prev = flipFirstCard();	  // this sets the previous card position to "prev"		
			if (cardNumber == prevCard) {  // MATCH!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				if (prev.children[0]!==el.parentNode) {  //confirm is not the same card
					
					// update pairs and check if finished
					let pairs = parseInt(document.getElementById("pairs").innerText);
					document.getElementById("pairs").innerText = pairs + 1;
					
					prev.children[0].style='transform: rotateY(540deg);';					
					el.parentNode.style='transform: rotateY(900deg);';	
					
					// change background of matched cards
					setTimeout(function(){
						prev.children[0].children[1].style.backgroundColor = '#fee'; 
						el.nextSibling.style.backgroundColor = '#fee';							
					}, 500);
					
					let cols = getcols();
					let target= (4*cols)/2;
					if (pairs+1==target) {
						stopTimer();
						setTimeout(function(){
							highlightAll();						
						}, 500);
					}
					
				} else {  // this may be because of double click on same card
					el.parentNode.style='transform: rotateY(360deg);';	
				}

			} else {
				el.parentNode.style='transform: rotateY(180deg);';	
				// half second delay
				setTimeout(function(){
					prev.children[0].style='transform: rotateY(360deg);';
					el.parentNode.style='transform: rotateY(360deg);';					
				}, 500);
			}
			
			localStorage.setItem("numpos", null);
			localStorage.setItem("cardnum", null);
		}	
	}
	
	function setPos(x, y) {
		for (var i = 0; i < tbl.rows.length; i++) {
			for (var j = 0; j < tbl.rows[i].cells.length; j++) {			
				if (tbl.rows[i].cells[j] === x.parentNode) {
					var pos = i + "," + j;
					localStorage.setItem("numpos", pos);
					localStorage.setItem("cardnum", y);						
					break;
				}
			}		
		}
	}
	
	function flipFirstCard() {
		var pos = localStorage.getItem("numpos");
		for (var i = 0; i < tbl.rows.length; i++) {
			for (var j = 0; j < tbl.rows[i].cells.length; j++) {			
				if (pos.substring(0, 1) == i && pos.substring(2, 3) == j) {
					var prev = tbl.rows[i].cells[j].children[0];
					return (prev);
					break;					
				}
			}		
		}
	}
	
	function arrangeCards(cells) {
		let pairs = cells/2;
		const cards = 34; //total number of pictures of teams
		
		//first loop puts random numbers in arr (as many as pairs or cells/2)
		let arr = [];
		for (let i=0; i < pairs; i++) {			
			do {
				let card = Math.floor(Math.random() * cards) + 1;  //randon card
				if (!arr.includes(card)) {
					arr[i]=card;
					break;
				}
			} while (arr.length<cards);
		}

		//second loop puts the numbers in arr twice randomly in new array (pairs_arr)
		let pairs_arr = [];
		for (var cell = 0; cell < cells; cell++){   
			let pos = Math.floor(Math.random() * arr.length);
			let card = arr [pos];
			if (pairs_arr.includes(card)) {
				arr.splice(pos, 1);			
			}					
			pairs_arr[cell] = card;
		}
		return (pairs_arr);
	}

	function highlightAll() {
		elements = document.getElementsByClassName("flip-box-back");
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.add("effect");
		}
	}
	
	//Timer function -----------------------------------------------------------------------------------------
	var timerVariable = setInterval(countUpTimer, 1000);
	var totalSeconds = 0;

	function countUpTimer() {
	  ++totalSeconds;
	  var hour = Math.floor(totalSeconds / 3600);
	  var minute = Math.floor((totalSeconds - hour * 3600) / 60);
	  var seconds = totalSeconds - (hour * 3600 + minute * 60);
	  document.getElementById("timer").innerHTML = pad(minute) + ":" + pad(seconds);
	}
	   
	function pad ( value ) { return value > 9 ? value : "0" + value; }

	function stopTimer() {
		clearInterval(timerVariable);
	}
