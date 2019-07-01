class Circle {
	init(maxWidth, maxHeight, radius, alpha)
	{
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		this.radius = radius;
		this.alpha = alpha;
		
		if (Math.random()<0.5){
			this.baseColor = "rgba(255,255,255,";
		}else{
			this.baseColor = "rgba(0,0,0,";
			this.alpha *= 0.6;
		}
		
		this.setupDelta();
	}
	
	draw(ctx, tone){
		this.updateValues(tone);
		
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,0, Math.PI*2,false);
		ctx.fillStyle = this.baseColor+this.alpha+")";
		ctx.fill();
	}
	
	updateValues(tone){
//		let c = Math.pow(BASE_OF_POW_IN_SPEED,tone);
		let c = INTERVAL_BASE/(INTERVAL_BASE-D_SPEED*tone);
		this.x += this.dx*c;
		this.y += this.dy*c;
		this.alpha -= this.da*c;
	}
	
	isDead(){
		if (this.alpha<0.0){
			return true;
		}
		
		let r = this.radius;
		if (this.x+r<0 || this.y+r<0 ){
			return true;
		}
		if (this.x-r>this.maxWidth||this.y-r>this.maxHeight){
			return true;
		}
		
		return false;
	}
	
	setRandomX(){
		this.x = Math.random()*this.maxWidth;		
	}
	
	setRandomY(){
		this.y = Math.random()*this.maxHeight;
	}
	
	setRandomDa(){
		this.da = this.alpha/random(100,50);
	}
	
	setupDelta(){
		this.dx = 0;
		this.dy = 0;
		this.setRandomDa();
	}
}


class CircleDot extends Circle{
	init(maxWidth, maxHeight, radius, alpha){
		super.init(maxWidth, maxHeight, radius, alpha);
		super.setRandomX();
		super.setRandomY();
	}
	
	setupDelta(){
		super.setupDelta();
		this.da *= 4;
	}
	
	create(){
		return new CircleDot();
	}
}

class CircleRandom extends CircleDot{
	init(maxWidth, maxHeight, radius, alpha){
		super.init(maxWidth, maxHeight, radius, alpha);
	}
	
	//override
	setupDelta(){
		this.dx = (Math.random()-0.5)*7;
		this.dy = (Math.random()-0.5)*7;
		this.setRandomDa();
	}
	
	create(){
		return new CircleRandom();
	}
}

class CircleFall extends Circle{
	init(maxWidth, maxHeight, radius, alpha){
		super.init(maxWidth, maxHeight, radius, alpha);
		super.setRandomX();
		super.setRandomY();
		this.y /= 2;
	}
	
	setupDelta(){
		super.setupDelta();
		this.dy = Math.random()*7;
	}
	
	create(){
		return new CircleFall();
	}
	
}

class CircleBubble extends Circle{
	init(maxWidth, maxHeight, radius, alpha){
		super.init(maxWidth, maxHeight, radius, alpha);
		super.setRandomX();
		super.setRandomY();
		this.y = (this.y+canvasHeight)/2;
	}
	
	setupDelta(){
		super.setupDelta();
		this.dy = -Math.random()*7;
	}
	
	create(){
		return new CircleBubble();
	}
	
	updateValues(tone){
		super.updateValues(tone);
		this.x += Math.sin((0.5*this.radius*this.y)/this.maxHeight)*this.dy*0.4;
	}
}