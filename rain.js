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

	Q.Sprite.extend("RainDripper", {
		init: function(p, stage) {
			this._super(p, {
				gravity: 0
			});
			this.add('Movement');
			this.stage = stage;
			this.toggle = 0;
		},
		draw: function(ctx) {
			//not visible
		},
		step: function(dt) {
			if (this.toggle % 6 == 0) {
				var x = (this.p.cx == 0 ? this.p.x : this.p.x + (this.p.cx - Math.random() * this.p.cx * 2));
				var y = (this.p.cy == 0 ? this.p.y : this.p.y + (this.p.cy - Math.random() * this.p.cy * 2)) - 4;
				this.stage.insert(new Q.BigDrop({x:x, y:y, vx: 0, vy: 0, cx:8, cy:8, gravity: 100}, this.stage));
			}
			this.toggle++;
		}
 	});
	
	Q.Sprite.extend("BigDrop", {
		init: function(p, stage) {
			this._super(p, {
				collisionMask: Q.SPRITE_NONE
			});
			this.add('Movement');
			this.stage = stage;
		},
		draw: function(ctx) {
			var radius = this.p.cx;
			var gradient = ctx.createRadialGradient(this.p.x + this.p.cx, this.p.y + this.p.cy, 0, this.p.x + this.p.cx, this.p.y + this.p.cy, radius);
			
			gradient.addColorStop(0, "rgba(128,128,255,.75)");
			gradient.addColorStop(0.9, "rgba(128,128,255,.75)");
			gradient.addColorStop(1, "rgba(128,128,255,0)");
			
			ctx.fillStyle = gradient;
			
			ctx.fillRect(this.p.x, this.p.y, this.p.cx * 2, this.p.cy * 2);
		},
		step: function(dt) {
			if (this.p.y + this.p.cy > 240) {
				for (var i=0;i<16;i++) {
					var vx = 60 - Math.random() * 120;
					var vy = -1 * (10 + Math.random() * 90);
					this.stage.insert(new Q.LittleDrop({x:this.p.x, y:240, vx: vx, vy: vy, cx:2, cy:2, gravity: 100}, this.stage));
				}
				this.destroy();	
			}
			if (this.p.vx > 240) {
				this.p.vx = 240;
			}
		}
	});
	
	Q.BigDrop.extend("LittleDrop", {
		init: function(p, stage) {
			this._super(p, stage);
		},
		step: function(dt) {
			if (this.p.y > 240) {
				this.destroy();	
			}
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

		stage.insert(new Q.RainDripper({x:120, y:0, cx:120, cy:0}, stage));
	});
	
	Q.load("level480.json,tiles.png,dog.png,background.png", function() {
		Q.stageScene("level1",0);
	});
});
