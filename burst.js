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

			this.entity.stage.collide(this.entity);
	    }
	});

	Q.Sprite.extend("FallingParticle", {
		init: function(p) {
			this._super(p, {
				collisionMask: Q.SPRITE_NONE
			});
			this.add('Movement');
			this.lifetime = 2;
			this.age = 0;
			this.originalSize = this.p.size;
		},
		draw: function(ctx) {
			if (this.age > 0) {
				var gradient = ctx.createRadialGradient(this.p.x + this.p.cx, this.p.y + this.p.cy, 0, this.p.x + this.p.cx, this.p.y + this.p.cy, this.p.cx);
				
				gradient.addColorStop(0, "rgba(255,255,255,0.8)");
				gradient.addColorStop(0.1, "rgba(255,0,0,0.8)");
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
			this.p.size = this.originalSize * (1 - (this.age / this.lifetime));
			this.p.cx = this.p.size / 2;
			this.p.cy = this.p.size / 2;
		}
	});

	Q.Sprite.extend("Emitter", {
		init: function(p, stage) {
			this._super(p, {
				gravity: 0
			});
			this.add('Movement');
			this.stage = stage;
		},
		draw: function(ctx) {
			//not visible
		},
		step: function(dt) {
			var x = (this.p.cx == 0 ? this.p.x : this.p.x + (this.p.cx - Math.random() * this.p.cx * 2));
			var y = (this.p.cy == 0 ? this.p.y : this.p.y + (this.p.cy - Math.random() * this.p.cy * 2));
			var vx = 100 - Math.random() * 200;
			var vy = 100 - Math.random() * 200;
			this.stage.insert(new Q.FallingParticle({x:x, y:y, vx:vx, vy:vy, size:10, gravity:100}));
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
		stage.insert(new Q.Repeater({ 
			asset: "background.png"
		}));

		stage.insert(new Q.Emitter({x:120, y:120, cx:0, cy:0}, stage));
	});
	
	Q.load("level480.json,tiles.png,dog.png,background.png", function() {
		Q.stageScene("level1",0);
	});
});
