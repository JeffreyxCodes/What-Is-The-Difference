$(function() {
	let oCanvas = $("#original-canvas")[0];
	oCanvas.width = window.innerWidth / 2 - 60;
	oCanvas.height = window.innerHeight  - 200;
	let octx = oCanvas.getContext("2d");

	let eCanvas = $("#edited-canvas")[0];
	eCanvas.width = oCanvas.width;
	eCanvas.height = oCanvas.height;
	let ectx = eCanvas.getContext("2d");

	const $intro = $("form#intro");
	const $win = $("form#win");
	const $loose = $("form#loose");
	const $secret = $("span#secret");

	const $time = $("#time");
	const initialTime = 10;
	let time = initialTime;
	let timeID;
	let freeze = false;
	const $score = $("#score");
	let score = 0;
	const $level = $("#level");
	let level = 1;

	let story = [
		`Site is currently under construction...
		play this game in the mean while :D`,
		`Opening your eyes to the darkness, you find yourself lying on a cold smooth surface. You try to think 
		back to how you to ended up in this moment, but absolutely nothing comes to mind.`,
		`You finally muster up the courage to feel around your surroundings, after waiting for something, anthing to 
		happen. Dialing your senses to 12, you paw your way around and slowly, but surely, a primal fear starts to set in...`,
		`"Walls on all sides and no opening of any kind. Lovely. Why not make the walls contract while we are at it."`,
		`As if the universe is displease with your optimism, the walls starts to contract ever so slowly.`,
		`Suddenly, one of the walls lights up...`
	]
	let storyID;

	/**************************************************************************************
	Function Name:
		randomInfo
	Parameters:
		unique (default value of 0) [0, 1]
			Value of 0 if info to be generated is for a shape that is exist on both canvases,
			else 1 for unique shape which needs to be found by user. The 0 or 1 determines
			the specific set of value the red will be generated which is use to determine
			whether a unique shape clicked.
		range [integer]
			An integer which adjust the possible value of width and height
			(or the corresponding pair values according to the shape).
		mod [integer]
			An integer which adjust the width and height in case they are too small.
		triMod (default value of 0) [0, 1]
			Value of 0 if the shape is not a triangle and 1 if it is a triangle. Use to
			do modification of the width and height (second point of the triangle).
	Return:
		[x, y, width, height, color]
		x [integer]
			The starting x coordinate .
		y [integer]
			The starting y coordinate.
		width [integer]
			The width of the shape or the corresponding value according to the shape.
		height [integer]
			The height of the shape or the corresponding value according to the shape.
		color [string]
			The color in rgba.
	Purpose:
		This function randomly generates the info for pseudo-common values in the three
		different shapes(triangle, rectangle, oval) use in this game. It also generates
		the red in rgba that is use to help determine whether a unique shape is clicked.
	**************************************************************************************/
	function randomInfo(unique = 0, range, mod, triMod = 0) {
		const x = Math.round(Math.random() * (eCanvas.width - 20));
		const y = Math.round(Math.random() * (eCanvas.height - 20));
		let width = Math.abs((x * triMod) + Math.round(Math.random() * range) - range / 2);
		let height = Math.abs((y * triMod) + Math.round(Math.random() * range) - range / 2);
		// adjust width and height if they are too small
		width = Math.abs(width - x * triMod) < mod ? width + mod + triMod * 2 * mod : width;
		height = Math.abs(height - y * triMod) < mod ? height + mod + triMod * 2 * mod : height;

		let red = Math.round(Math.random() * 235);
		// even red color used to differentiate between odd red color of shapes that need to be found
		red = red % 2 === unique ? red : red - 1;
		const color = `rgba(${red}, ${Math.round(Math.random() * 235)}, ${Math.round(Math.random() * 235)}, 1`;
		return [x, y, width, height, color];
	}

	/**************************************************************************************
	Function Name:
		randomOvalInfo
	Parameters:
		unique (default value of 0) [0, 1]
			Value of 0 if info to be generated is for a shape that is exist on both canvases,
			else 1 for unique shape which needs to be found by user.
	Return:
		[x, y, xRadius, yRadius, rotation, color]
		x [integer]
			The starting x coordinate.
		y [integer]
			The starting y coordinate.
		xRadius [integer]
			The x radius of the oval.
		yRadius [integer]
			The y radius of the oval.
		rotation [integer]
			The rotation of the oval in degrees.
		color [string]
			The color in rgba.
	Purpose:
		This function with the help of the function randomInfo, generates the random value
		for a oval.
	**************************************************************************************/
	function randomOvalInfo(unique = 0) {
		let [x, y, xRadius, yRadius, color] = randomInfo(unique, 120, 10);
		const rotation = Math.PI / (Math.floor(Math.random() * 180) + 1);
		return [x, y, xRadius, yRadius, rotation, color]
	}

	/**************************************************************************************
	Function Name:
		drawOval
	Parameters:
		c
			The context to draw in.
		x
			The starting x coordinate.
		y
			The starting y coordinate.
		xRadius
			The x radius of the oval.
		yRadius
			The y radius of the oval.
		r
			The rotation of the oval in degrees.
		color
			The color in rgba.
	Purpose:
		This function draws a random filled oval.
	**************************************************************************************/
	function drawOval(c, x, y, xRadius, yRadius, r, color) {
		c.beginPath();
		c.ellipse(x, y, xRadius, yRadius, r, 0, 2 * Math.PI);
		c.fillStyle = color;
		c.fill();
	}

	/**************************************************************************************
	Function Name:
		randomRectInfo
	Parameters:
		unique (default value of 0) [0, 1]
			Value of 0 if info to be generated is for a shape that is exist on both canvases,
			else 1 for unique shape which needs to be found by user.
	Return:
		[x, y, width, height, color]
		x [integer]
			The starting x coordinate.
		y [integer]
			The starting y coordinate.
		width [integer]
			The width of the rectangle.
		height [integer]
			The height of the rectangle.
		color [string]
			The color in rgba.
	Purpose:
		This function with the help of the function randomInfo, generates the random value
		for a rectangle.
	**************************************************************************************/
	function randomRectInfo(unique = 0) {
		let [x, y, width, height, color] = randomInfo(unique, 200, 40);
		return [x, y, width, height, color];
	}

	/**************************************************************************************
	Function Name:
		drawRect
	Parameters:
		c
			The context to draw in.
		x
			The starting x coordinate.
		y
			The starting y coordinate.
		width
			The width of the rectangle.
		height
			The height of the rectangle.
		color
			The color in rgba.
	Purpose:
		This function draws a random filled rectangle.
	**************************************************************************************/
	function drawRect(c, x, y, width, height, color) {
		c.fillStyle = color;
		c.fillRect(x, y, width, height);
	}

	/**************************************************************************************
	Function Name:
		randomTriangleInfo
	Parameters:
		unique (default value of 0) [0, 1]
			Value of 0 if info to be generated is for a shape that is exist on both canvases,
			else 1 for unique shape which needs to be found by user.
	Return:
		[x0, y0, x1, y1, x2, y2, color]
		x0 [integer]
			The x coordinate of the 1st point.
		y0 [integer]
			The y coordinate of the 1st point.
		x1 [integer]
			The x coordinate of the 2nd point.
		y1 [integer]
			The y coordinate of the 2nd point.
		x2 [integer]
			The x coordinate of the 3rd point.
		y2 [integer]
			The y coordinate of the 3rd point.
		color [string]
			The color in rgba.
	Purpose:
		This function with the help of the function randomInfo, generates the random value
		for a triangle.
	**************************************************************************************/
	function randomTriangleInfo(unique = 0) {
		let [x0, y0, x1, y1, color] = randomInfo(unique, 120, 15, 1);
		let x2 = Math.abs(Math.round((x0 + x1) / 2) + (Math.round(Math.random() * 50) - 25));
		let y2 = Math.abs(Math.round((y0 + y1) / 2) + (Math.round(Math.random() * 50) - 25));
		if (Math.abs(x0 - x1) > Math.abs(y0 - y1)) {
			y2 = y2 + Math.round(Math.random() * 140) + 30;
		} else {
			x2 = x2 + Math.round(Math.random() * 140) + 30;
		}
		return [x0, y0, x1, y1, x2, y2, color];
	}

	/**************************************************************************************
	Function Name:
		drawTriangle
	Parameters:
		c
			The context to draw in.
		x0 [integer]
			The x coordinate of the 1st point.
		y0 [integer]
			The y coordinate of the 1st point.
		x1 [integer]
			The x coordinate of the 2nd point.
		y1 [integer]
			The y coordinate of the 2nd point.
		x2 [integer]
			The x coordinate of the 3rd point.
		y2 [integer]
			The y coordinate of the 3rd point.
		color [string]
			The color in rgba.
	Purpose:
		This function draws a random filled triangle.
	**************************************************************************************/
	function drawTriangle(c, x0, y0, x1, y1, x2, y2, color) {
		c.beginPath();
		c.moveTo(x0, y0);
		c.lineTo(x1, y1);
		c.lineTo(x2, y2);
		c.closePath();
		c.fillStyle = color;
		c.fill();
	}

	/**************************************************************************************
	Function Name:
		drawUniqueShape
	Parameters:
		n [0, 1, 2]
			0 to draw oval, 1 to draw rectangle, 2 to draw triangle.
	Purpose:
		This function draws a random unique shape that the user needs to find.
	**************************************************************************************/
	function drawUniqueShape(n) {
		switch (n) {
			case 0:
				drawOval(ectx, ...randomOvalInfo(1));
				break;
			case 1:
				drawRect(ectx, ...randomRectInfo(1));
				break;
			case 2:
				drawTriangle(ectx, ...randomTriangleInfo(1));
		}
	}

	/**************************************************************************************
	Function Name:
		setStage
	Parameters:
		n [integer]
			The number of shapes to draw on each canvas.
	Purpose:
		This function draws a given number of shapes on each canvas and then draws
		a random unique shape.
	**************************************************************************************/
	function setStage(n) {
		let info;
		for (let i = 0; i < n; i++) {
			info = randomTriangleInfo();
			drawTriangle(octx, ...info);
			drawTriangle(ectx, ...info);

			info = randomRectInfo();
			drawRect(octx, ...info);
			drawRect(ectx, ...info);

			info = randomOvalInfo();
			drawOval(octx, ...info);
			drawOval(ectx, ...info);
		}
		drawUniqueShape(Math.floor(Math.random() * 3));
	}

	/**************************************************************************************
	Function Name:
		clearStage
	Purpose:
		This function clears both canvases.
	**************************************************************************************/
	function clearStage() {
    	octx.clearRect(0, 0, oCanvas.width, oCanvas.height);
    	ectx.clearRect(0, 0, eCanvas.width, eCanvas.height);
	}

	/**************************************************************************************
	Function Name:
		checkColor
	Parameters:
		e [event object]
			The event object from a click event.
	Purpose:
		This callback function checks the color of the pixel the click event occur on and
		if it's the color of the unique shape, it then update the score, level and time 
		appropriately follow by clearing the two canvases as well as prompt the user on
		the for the next level. 
	**************************************************************************************/
	function checkColor(e) {
        const red = ectx.getImageData(e.offsetX, e.offsetY, 1, 1).data[0];
        // if the unique shape is found, update appropriate values and clear the stage
        if (red % 2 === 1) {
        	update();
        }
	}

	/**************************************************************************************
	Function Name:
		update
	Purpose:
		This function updates the stats and prepares for the next level. 
	**************************************************************************************/
	function update() {
    	clearInterval(timeID);
    	score += time;

    	if (score > 99) {
    		story.push("The walls comes to a stop, but what now...          (Part 1 Ended)");
    		$intro.find("button").hide();
    		$intro.slideDown(600, runStory);
    	}

    	$score.text(score);
    	level++;
    	$level.text(level);
    	time = level > 20 ? 5 : initialTime - Math.floor(level / 5);
    	clearStage();
    	$win.fadeIn(600);
	}

	/**************************************************************************************
	Function Name:
		countDown
	Purpose:
		This function sets the count down for each level. 
	**************************************************************************************/
	function countDown() {
		timeID = setInterval(function() {
			time--;
			$time.text(time);
			if (time === 0) {
				clearInterval(timeID);
				eCanvas.removeEventListener("click", checkColor);
				$secret.off("click");
				$loose.find("h3").html(`You lost!<br/>You made it to level ${level} with a score of ${score}
					<br/>Click "Restart" to try again.`);
				$loose.fadeIn(600);
			}
		}, 1000);
	}

	/**************************************************************************************
	Function Name:
		gameFlow
	Purpose:
		This function updates the time the user sees, controls the loosing condition
		which is when the time reaches 0 and essentially starts the level.
	**************************************************************************************/
	function gameFlow() {
		$time.text(time);
		if (!freeze) {
			countDown();
		}
	
		setStage(Math.ceil(level / 3));
	}

	/**************************************************************************************
	Function Name:
		gamePlay
	Purpose:
		This function initializes story and the event listeners for the very first time.
	**************************************************************************************/
	function gamePlay() {
		$("form#instructions").find("button").click(function() {
			$("form#instructions").hide();
			secret();
			eCanvas.addEventListener("click", checkColor);
			gameFlow();
		});
	}

	/**************************************************************************************
	Function Name:
		runStory
	Purpose:
		This function displays part of the script one character at a time.
	**************************************************************************************/
	function runStory() {
		let $script = $("#story");
		let script = "";
		let c = 0;

		storyID = setInterval(function() {
			script = story[0].slice(0, c);
			$script.text(script);
			if (story[0].length === c) {
				clearInterval(storyID);
			} 
			// if the character is a empty space, then don't display it alone.
			c = story[0][c + 1] === " " ? c + 1 : c + 2;
		}, 100);
	}

	/**************************************************************************************
	Function Name:
		nextScript
	Purpose:
		This callback function moves along the script by displaying the next script when the user
		clicks.
	**************************************************************************************/
	function nextScript() {
		clearInterval(storyID);
		story.shift();
		if (story.length === 0) {
			$intro.off("click");
			$intro.find("button").fadeIn();
		} else {
			runStory();
		}
	}

	/**************************************************************************************
	Function Name:
		secret
	Purpose:
		This function adds the click event listener for the secret input in the game.
	**************************************************************************************/
	function secret() {
		$secret.click(function() {
			const input = prompt("???: ");
			let int = parseInt(input);
			if (!isNaN(int) && int > 0) {
				level = int - 1;
				update();
			} else if (input === "stop time" && !freeze) {
				freeze = true;
				clearInterval(timeID);
			} else if (input === "start time" && freeze) {
				freeze = false;
				countDown();
			}
		});
	}

	/**************************************************************************************
	Function Name:
		init
	Purpose:
		This function initializes story and the event listeners for the very first time.
	**************************************************************************************/
	function init() {
		// run the story
		runStory();
		$intro.on("click", nextScript);

		$intro.find("button").click(function() {
			$intro.slideUp(600, gamePlay);
		});

		// click after winning to proceed
		$win.find("button").click(function() {
			$win.hide();
			gameFlow();
		});

		// click after loosing to continue
		$loose.find("button").click(function() {
			$loose.hide();
			[time, score, level] = [initialTime, 0, 1];
			$score.text(score);
			$level.text(level);
			clearStage();
			secret();
			gameFlow();
			eCanvas.addEventListener("click", checkColor);
		});
	}

	//------- run game -------//
	init();
});