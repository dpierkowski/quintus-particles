window.addEventListener("load", function() {
	
	var Q = window.Q = Quintus().include("Sprites, Scenes, Input, Anim, 2D, Touch, UI");
	Q.setup("quintus")
	.controls().touch(Q.SPRITE_ALL);
	
	Q.gravityX = 0;
	Q.gravityY = 1;
	
	Q.tileDimension = 16;

	Q.component('Movement',{
	    added: function() {
	        var entity = this.entity;
	        Q._defaults(entity.p,{
	          vx: 0,
	          vy: 0,
	          ax: 0,
	          ay: 0,
	          gravity: 0,
	          collisionMask: Q.SPRITE_DEFAULT
	        });
	        entity.on('step',this,"step");
	    },
	    step: function(dt) {
			var p = this.entity.p;

			p.vx += p.ax * dt + Q.gravityX * dt * p.gravity;
			p.vy += p.ay * dt + Q.gravityY * dt * p.gravity;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
	    }
	});

	Q.Sprite.extend("FireworkLauncher", {
		init: function(p, stage) {
			this._super(p, {
				gravity: 0
			});
			this.add('Movement');
			this.stage = stage;
			this.counter = 0;
		},
		draw: function(ctx) {
			//not visible
		},
		step: function(dt) {
			if (this.counter >= 40) {
				this.counter = 0;
				var x = (this.p.cx == 0 ? this.p.x : this.p.x + (this.p.cx - Math.random() * this.p.cx * 2));
				var y = 240;
				var vx = 30 - Math.random() * 60;
				var vy = -1 * (100 + Math.random() * 40);
				this.stage.insert(new Q.Firework({x:x, y:y, vx: vx, vy: vy, cx:3, cy:3, ax:0 ,ay:-60, gravity: 100}, this.stage));
			} else {
				this.counter++;
			}
		}
 	});

	Q.Sprite.extend("Firework", {
		init: function(p, stage) {
			this._super(p, {
				collisionMask: Q.SPRITE_NONE
			});
			this.add('Movement');
			this.stage = stage;
			this.color = [255,255,0];
		},
		draw: function(ctx) {
			var gradient = ctx.createRadialGradient(this.p.x + this.p.cx, this.p.y + this.p.cy, 0, this.p.x + this.p.cx, this.p.y + this.p.cy, this.p.cx);
			
			gradient.addColorStop(0, "rgba(255,255,255,0.8)");
			gradient.addColorStop(0.1, "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ",0.8)");
			gradient.addColorStop(1, "rgba(0,0,0,0)");
			
			ctx.fillStyle = gradient;
			
			ctx.fillRect(this.p.x, this.p.y, this.p.cx * 2, this.p.cy * 2);
		},
		step: function(dt) {
			if (this.p.vy >= 0) {
				for (var i=0;i<30;i++) {
					
					var v = 1 - Math.random() * 2;
					var vx = 60 * v;
					var vy = 60 * Math.sqrt(1 - v * v) * (Math.random() > 0.5 ? 1 : -1);
					this.stage.insert(new Q.Spark({x:this.p.x, y:this.p.y, vx: vx, vy: vy, cx:4, cy:4, gravity: 100}, this.color));

					for (var j=0;j<4;j++) {
						var v1 = 60 - Math.random() * 60;
						var v2 = 1 - Math.random() * 2;
						var vx = v1 * v2;
						var vy = v1 * Math.sqrt(1 - v2 * v2) * (Math.random() > 0.5 ? 1 : -1);
						this.stage.insert(new Q.Spark({x:this.p.x, y:this.p.y, vx: vx, vy: vy, cx:4, cy:4, gravity: 100}, this.color));
					}
				}
				this.destroy();
			}
		}
	});
	
	Q.Sprite.extend("Spark", {
		init: function(p, color) {
			this._super(p, {
				collisionMask: Q.SPRITE_NONE
			});
			this.add('Movement');
			this.lifetime = 2;
			this.age = 0;
			this.originalSize = 8;
			this.originalX = this.p.x;
			this.originalY = this.p.y;
			this.size = this.originalSize;
			this.color = color;
		},
		draw: function(ctx) {
			if (this.age > 0) {
				var gradient = ctx.createRadialGradient(this.p.x + this.p.cx, this.p.y + this.p.cy, 0, this.p.x + this.p.cx, this.p.y + this.p.cy, this.p.cx);
				
				gradient.addColorStop(0, "rgba(255,255,255,0.8)");
				gradient.addColorStop(0.1, "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ",0.8)");
				gradient.addColorStop(1, "rgba(0,0,0,0)");
				
				ctx.fillStyle = gradient;
				
				ctx.fillRect(this.p.x, this.p.y, this.p.cx * 2, this.p.cy * 2);
			}
		},
		step: function(dt) {
			this.age += dt;
			
			if (this.age > this.lifetime) {
				this.destroy();	
			}
			this.size = this.originalSize * (1 - (this.age / this.lifetime));
			this.p.cx = this.size / 2;
			this.p.cy = this.size / 2;
		}
	});
	
	Q.scene("level1", function(stage) {
		stage.add('collisions');
		var tileLayer = new Q.TileLayer({
			dataAsset: 'level480.json',
			sheet: 'tiles',
			tileW: Q.tileDimension,
			tileH: Q.tileDimension
		});
		stage.collisionLayer(tileLayer);

		stage.insert(new Q.FireworkLauncher({x:120, y:240, cx:0, cy:0}, stage));
	});
	
	Q.load("level480.json,tiles.png,dog.png,background.png", function() {
				 Q.sheet("tiles", "tiles.png", {
			 tilew: Q.tileDimension,
             tileh: Q.tileDimension
          });
		Q.stageScene("level1",0);
	});
});
