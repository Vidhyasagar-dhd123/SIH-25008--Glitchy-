import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Volume2, VolumeX, RotateCcw, Play, Pause } from "lucide-react";

// Import sprite images
import roomBg from "../assets/RoomBg.png";
import spriteBuildingsShaking from "../assets/spriteBuildingsShaking.png";
import spriteChar1 from "../assets/spriteChar1.png";
import spriteCharEarthQuake from "../assets/spriteCharEarthQuake.png";
import spriteCharFire from "../assets/spriteCharFire.png";
import spriteFire from "../assets/spriteFire.png";

const DisasterDrillGame = () => {
    
  const gameRef = useRef(null);


  useEffect(() => {
    class StageOne extends Phaser.Scene {
      constructor() {
        super("StageOne");
      }
      preload() {
        // Load background image
        this.load.image("roomBg", roomBg);
        
        // Load character spritesheet
        this.load.spritesheet("sprite", spriteCharEarthQuake, {
          frameWidth: 210,
          frameHeight: 310,
        });
        
        // Load fire spritesheet
        this.load.spritesheet("fire", spriteFire, {
          frameWidth: 220,
          frameHeight: 300,
        });
      }
      create() {
        // Add background image
        const bg = this.add.image(300, 200, "roomBg");
        bg.setDisplaySize(600, 400);
        bg.setAlpha(0.8); // Slightly transparent for better gameplay visibility
        
        this.add.text(200, 20, "Stage 1", {
          fontSize: "28px",
          fill: "#000",
        });

        // Animations
        this.anims.create({
          key: "idle",
          frames: this.anims.generateFrameNumbers("sprite", { start: 0, end: 0 }),
          frameRate: 2,
          repeat: -1,
        });
        this.anims.create({
          key: "walk",
          frames: this.anims.generateFrameNumbers("sprite", { start: 1, end: 5 }),
          frameRate: 15,
          repeat: -1,
        });
        this.anims.create({
          key: "strike",
          frames: this.anims.generateFrameNumbers("sprite", { start: 26, end: 35 }),
          frameRate: 30,
          repeat: -1,
        });
        
        this.anims.create({
          key: "down",
          frames: this.anims.generateFrameNumbers("sprite", { start: 17, end: 19 }),
          frameRate: 30,
          repeat: 0,
        });

        // Fire animation
        this.anims.create({
          key: "burn",
          frames: this.anims.generateFrameNumbers("fire", { start: 0, end: 15 }),
          frameRate: 20,
          repeat: -1,
        });

        // Player
        this.player = this.physics.add.sprite(100, 320, "sprite").setScale(0.5).play("idle");
        this.player.setCollideWorldBounds(true);

        // Ground
        this.ground = this.add.rectangle(300, 380, 600, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);
        this.physics.add.collider(this.player, this.ground);

        // Moving fire obstacle
        this.movingFire = this.physics.add.sprite(200, 200, "fire").setScale(0.5).play("burn");
        this.movingFire.body.setVelocityX(80);
        this.movingFire.body.setSize(50, 50); // Set collision box size

        // Fire bouncing movement
        this.movingFire.body.setCollideWorldBounds(true);
        this.movingFire.body.setBounce(1, 0);
        this.physics.add.collider(this.movingFire, this.ground);
        this.physics.add.overlap(this.player, this.movingFire, () => {
          this.add.text(200, 300, "🔥 Burned!", {
            fontSize: "32px",
            fill: "#ff0000",
          });
          this.physics.pause();
          this.player.setTint(0xff0000);
          this.player.play("down", true);
          this.failed = true;
        });
        // Goal portal
        this.goal = this.add.rectangle(550, 350, 50, 50, 0x00ff00);
        this.physics.add.existing(this.goal, true);
        this.physics.add.overlap(this.player, this.goal, () => {
          this.scene.start("StageTwo");
        });

        this.cursors = this.input.keyboard.createCursorKeys();
      }
      update() {
        if(this.failed) return;
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-120);
          this.player.play("walk", true);
          this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(120);
          this.player.play("walk", true);
          this.player.flipX = false;
        } else {
          this.player.setVelocityX(0);
          this.player.play("idle", true);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.player.body.blocked.down) {
          this.player.setVelocityY(-200);
        }
      }
    }

    class StageTwo extends Phaser.Scene {
      constructor() {
        super("StageTwo");
      }
      create() {
        // Add background image
        const bg = this.add.image(300, 200, "roomBg");
        bg.setDisplaySize(600, 400);
        bg.setAlpha(0.8); // Slightly transparent for better gameplay visibility
        
        this.add.text(200, 20, "Stage 2", {
          fontSize: "28px",
          fill: "#000",
        });

        this.player = this.physics.add.sprite(210, 320, "sprite").setScale(0.2).play("idle");
        this.player.setCollideWorldBounds(true);

        this.ground = this.add.rectangle(200, 390, 200, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);
        this.physics.add.collider(this.player, this.ground);

        // Multiple moving obstacles
        this.obstacles = this.physics.add.group();
        for (let i = 0; i < 2; i++) {
          let obs = this.add.rectangle(0 + i * 120, 400, 60, 20, 0x0000ff);
          this.physics.add.existing(obs);
          obs.body.setImmovable(true);
          obs.body.setVelocityX(i % 2 === 0 ? 80 : -80);
          obs.body.setBounce(1, 0);
          obs.body.setCollideWorldBounds(true);
          this.obstacles.add(obs);
        }
        this.physics.add.collider(this.player, this.obstacles);

        // Victory area
        this.goal = this.add.rectangle(550, 350, 50, 50, 0xffff00);
        this.physics.add.existing(this.goal, true);
        this.physics.add.overlap(this.player, this.goal, () => {
          this.add.text(200, 300, "🎉 YOU WIN!", {
            fontSize: "32px",
            fill: "#008800",
          });
          this.physics.pause();
          this.player.setTint(0x00ff00);
        });

        this.cursors = this.input.keyboard.createCursorKeys();
      }
      update() {
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-120);
          this.player.play("walk", true);
          this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(120);
          this.player.play("walk", true);
          this.player.flipX = false;
        } else {
          this.player.setVelocityX(0);
          this.player.play("idle", true);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.player.body.blocked.down) {
          this.player.setVelocityY(-200);
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 600,
      height: 400,
      parent: gameRef.current,
      backgroundColor: "#ececec",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 300 }, debug: false },
      },
      scene: [StageOne, StageTwo],
    };

    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default DisasterDrillGame;