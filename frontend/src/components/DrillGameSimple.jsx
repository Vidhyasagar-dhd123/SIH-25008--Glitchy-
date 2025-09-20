import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

// Import sprite images - adjust paths as needed
import roomBg from "../assets/RoomBg.png";
import spriteBuildingsShaking from "../assets/spriteBuildingsShaking.png";
import spriteChar1 from "../assets/spriteChar1.png";
import spriteCharEarthQuake from "../assets/spriteCharEarthQuake.png";
import spriteFire from "../assets/spriteFire.png";

const DrillGameSimple = () => {
    const gameRef = useRef(null);
    const phaserGameRef = useRef(null);
    const [currentDrill, setCurrentDrill] = useState(null);
    const [gamePhase, setGamePhase] = useState('menu');
    const [speechEnabled, setSpeechEnabled] = useState(true);

    // Speech synthesis with better voice control
    const speak = (text, options = {}) => {
        if (!speechEnabled) return;
        
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.urgent ? 1.2 : 0.9;
        utterance.pitch = options.urgent ? 1.3 : 1.0;
        utterance.volume = 0.8;
        
        // Wait for voices to load
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                speechSynthesis.speak(utterance);
            }, { once: true });
        } else {
            speechSynthesis.speak(utterance);
        }
    };

    // Game scenes
    const createGameScene = (drillType) => {
        return {
            key: `${drillType}Drill`,
            preload: function() {
                console.log('Loading sprites...');
                // Load background and sprites
                this.load.image('room', roomBg);
                this.load.image('buildingShaking', spriteBuildingsShaking);
                this.load.image('char1', spriteChar1);
                this.load.image('charEarthquake', spriteCharEarthQuake);
                this.load.image('fire', spriteFire);

                // Loading progress
                this.load.on('progress', (value) => {
                    console.log('Loading progress:', value);
                });
            },
            create: function() {
                console.log(`Creating ${drillType} drill scene`);
                const scene = this;
                
                // Scene properties
                scene.drillType = drillType;
                scene.phase = 'instruction';
                scene.step = 0;
                scene.score = 0;
                scene.completed = false;

                // Background
                const bg = scene.add.image(400, 300, 'room');
                bg.setDisplaySize(800, 600);
                bg.setAlpha(0.8);

                // Character
                const charSprite = drillType === 'fire' ? 'charFire' : 'charEarthquake';
                scene.player = scene.physics.add.sprite(100, 450, charSprite);
                scene.player.setScale(0.8);
                scene.player.setCollideWorldBounds(true);
                scene.player.body.setSize(50, 60);

                // Drill-specific setup
                if (drillType === 'fire') {
                    scene.setupFireDrill();
                } else if (drillType === 'earthquake') {
                    scene.setupEarthquakeDrill();
                }

                // UI Elements
                scene.createUI();
                
                // Controls
                scene.cursors = scene.input.keyboard.createCursorKeys();
                scene.wasd = scene.input.keyboard.addKeys('W,S,A,D');
                scene.spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

                // Start drill
                scene.time.delayedCall(1000, () => {
                    scene.startDrill();
                });
            },
            
            setupFireDrill: function() {
                const scene = this;
                
                // Fire sprites with animation
                scene.fires = [];
                const firePositions = [
                    { x: 600, y: 200 },
                    { x: 650, y: 150 },
                    { x: 550, y: 250 }
                ];
                
                firePositions.forEach((pos, index) => {
                    const fire = scene.add.image(pos.x, pos.y, 'fire');
                    fire.setScale(0.4 + index * 0.1);
                    fire.setAlpha(0.9);
                    scene.fires.push(fire);
                    
                    // Fire animation - flickering effect
                    scene.tweens.add({
                        targets: fire,
                        scaleX: fire.scaleX + 0.1,
                        scaleY: fire.scaleY + 0.1,
                        alpha: 0.7,
                        duration: 800 + index * 200,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Power2'
                    });
                    
                    // Color tint animation
                    scene.tweens.add({
                        targets: fire,
                        tint: 0xff6600,
                        duration: 1200,
                        yoyo: true,
                        repeat: -1
                    });
                });

                // Smoke effect placeholder
                scene.smokeEffect = scene.add.graphics();
                scene.smokeEffect.fillStyle(0x666666, 0.3);
                scene.smokeEffect.fillRect(500, 0, 300, 400);
                
                // Smoke animation
                scene.tweens.add({
                    targets: scene.smokeEffect,
                    alpha: 0.1,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });

                // Exit door
                scene.exitDoor = scene.add.rectangle(750, 300, 50, 120, 0x00aa00);
                scene.exitDoor.setStrokeStyle(3, 0x006600);
                scene.exitDoor.setInteractive();
                
                // Door glow effect
                scene.tweens.add({
                    targets: scene.exitDoor,
                    alpha: 0.7,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1
                });

                // Temperature check area (door handle)
                scene.doorHandle = scene.add.circle(720, 290, 8, 0xff4444);
                scene.doorHandle.setInteractive();
                
                scene.instructions = [
                    "🔥 FIRE EMERGENCY! Stay calm and follow instructions.",
                    "First, check if the door handle is hot. Click on the red door handle.",
                    "Good! The door is safe. Now stay low to avoid smoke.",
                    "Move towards the green exit door while staying low.",
                    "Click on the exit door to evacuate safely.",
                    "Excellent! You've safely evacuated. Meet at assembly point."
                ];
            },

            setupEarthquakeDrill: function() {
                const scene = this;
                
                // Shaking building
                scene.building = scene.add.image(400, 200, 'buildingShaking');
                scene.building.setScale(0.7);
                scene.building.setAlpha(0.9);
                
                // Building shake animation
                scene.buildingShake = scene.tweens.add({
                    targets: scene.building,
                    x: 405,
                    y: 205,
                    duration: 150,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Power2'
                });

                // Camera shake for earthquake effect
                scene.cameras.main.shake(100, 0.01);

                // Protective desk
                scene.desk = scene.add.rectangle(300, 480, 120, 60, 0x8B4513);
                scene.desk.setStrokeStyle(3, 0x654321);
                scene.desk.setInteractive();
                
                // Desk highlight animation
                scene.tweens.add({
                    targets: scene.desk,
                    alpha: 0.8,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });

                // Falling debris animation placeholders
                scene.debris = [];
                for (let i = 0; i < 5; i++) {
                    const debris = scene.add.rectangle(
                        100 + i * 150, 
                        -50, 
                        20, 20, 
                        0x888888
                    );
                    scene.debris.push(debris);
                    
                    // Falling animation
                    scene.tweens.add({
                        targets: debris,
                        y: 600,
                        duration: 3000 + i * 500,
                        repeat: -1,
                        delay: i * 1000
                    });
                }

                // Safe zone indicator
                scene.safeZone = scene.add.circle(300, 480, 80, 0x00ff00, 0.2);
                scene.safeZone.setStrokeStyle(2, 0x00aa00);
                
                scene.instructions = [
                    "🌍 EARTHQUAKE! Follow Drop, Cover, and Hold On.",
                    "DROP: Get down on your hands and knees immediately!",
                    "COVER: Take cover under the brown desk. Click on it!",
                    "HOLD ON: Stay under cover and protect your head.",
                    "Wait for the shaking to stop...",
                    "Great! You survived the earthquake safely!"
                ];
            },

            createUI: function() {
                const scene = this;
                
                // Instruction panel
                scene.instructionPanel = scene.add.rectangle(400, 50, 780, 80, 0x000000, 0.8);
                scene.instructionPanel.setStrokeStyle(2, 0xffffff);
                
                scene.instructionText = scene.add.text(400, 50, '', {
                    fontSize: '18px',
                    fill: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 750 }
                }).setOrigin(0.5);

                // Progress indicator
                scene.progressText = scene.add.text(20, 560, 'Step: 0/6', {
                    fontSize: '16px',
                    fill: '#ffff00'
                });

                // Score
                scene.scoreText = scene.add.text(200, 560, 'Score: 0', {
                    fontSize: '16px',
                    fill: '#00ff00'
                });

                // Continue prompt
                scene.continueText = scene.add.text(400, 580, 'Press SPACE to continue', {
                    fontSize: '14px',
                    fill: '#cccccc',
                    align: 'center'
                }).setOrigin(0.5);
                
                // Blinking continue text
                scene.tweens.add({
                    targets: scene.continueText,
                    alpha: 0.3,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            },

            startDrill: function() {
                const scene = this;
                speak(`Starting ${scene.drillType} drill. Listen carefully and follow all instructions.`, { urgent: true });
                scene.nextInstruction();
            },

            nextInstruction: function() {
                const scene = this;
                
                if (scene.step < scene.instructions.length) {
                    const instruction = scene.instructions[scene.step];
                    scene.instructionText.setText(instruction);
                    scene.progressText.setText(`Step: ${scene.step + 1}/${scene.instructions.length}`);
                    
                    speak(instruction);
                    scene.step++;
                } else {
                    scene.completeDrill();
                }
            },

            completeDrill: function() {
                const scene = this;
                scene.completed = true;
                
                // Stop all animations
                scene.tweens.killAll();
                scene.cameras.main.stopFollow();
                
                // Success message
                const successText = scene.add.text(400, 300, 
                    `🎉 ${scene.drillType.toUpperCase()} DRILL COMPLETED! 🎉`, {
                    fontSize: '32px',
                    fill: '#00ff00',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5);
                
                // Success animation
                scene.tweens.add({
                    targets: successText,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 1000,
                    yoyo: true,
                    repeat: 2
                });

                speak(`Congratulations! You have successfully completed the ${scene.drillType} drill. You are now better prepared for emergencies.`);
                
                // Auto return to menu after delay
                scene.time.delayedCall(5000, () => {
                    setGamePhase('menu');
                    setCurrentDrill(null);
                });
            },

            update: function() {
                const scene = this;
                
                if (scene.completed) return;

                // Player movement
                const speed = 200;
                
                if (scene.cursors.left.isDown || scene.wasd.A.isDown) {
                    scene.player.setVelocityX(-speed);
                    scene.player.setFlipX(true);
                } else if (scene.cursors.right.isDown || scene.wasd.D.isDown) {
                    scene.player.setVelocityX(speed);
                    scene.player.setFlipX(false);
                } else {
                    scene.player.setVelocityX(0);
                }

                if (scene.cursors.up.isDown || scene.wasd.W.isDown) {
                    if (scene.player.body.touching.down) {
                        scene.player.setVelocityY(-400);
                    }
                }

                // Space bar to continue
                if (Phaser.Input.Keyboard.JustDown(scene.spacebar)) {
                    scene.nextInstruction();
                }

                // Drill-specific interactions
                if (scene.drillType === 'fire') {
                    scene.updateFireDrill();
                } else if (scene.drillType === 'earthquake') {
                    scene.updateEarthquakeDrill();
                }
            },

            updateFireDrill: function() {
                const scene = this;
                
                // Handle door interactions
                scene.doorHandle.on('pointerdown', () => {
                    if (scene.step === 2) {
                        scene.score += 100;
                        scene.scoreText.setText(`Score: ${scene.score}`);
                        speak("Good! You checked the door handle. It's safe to proceed.");
                        scene.nextInstruction();
                    }
                });

                scene.exitDoor.on('pointerdown', () => {
                    if (scene.step >= 5) {
                        scene.score += 200;
                        scene.scoreText.setText(`Score: ${scene.score}`);
                        scene.completeDrill();
                    }
                });
            },

            updateEarthquakeDrill: function() {
                const scene = this;
                
                // Handle desk interaction
                scene.desk.on('pointerdown', () => {
                    if (scene.step >= 3 && scene.step <= 5) {
                        scene.score += 150;
                        scene.scoreText.setText(`Score: ${scene.score}`);
                        
                        // Move player under desk
                        scene.player.setPosition(300, 450);
                        speak("Excellent! You're safely under cover.");
                        
                        setTimeout(() => {
                            scene.nextInstruction();
                        }, 2000);
                    }
                });
            }
        };
    };

    // Initialize game
    const initGame = (drillType) => {
        if (phaserGameRef.current) {
            phaserGameRef.current.destroy(true);
        }

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            backgroundColor: '#2c3e50',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 500 },
                    debug: false
                }
            },
            scene: createGameScene(drillType)
        };

        phaserGameRef.current = new Phaser.Game(config);
    };

    // Start specific drill
    const startDrill = (drillType) => {
        setCurrentDrill(drillType);
        setGamePhase('playing');
        setTimeout(() => {
            initGame(drillType);
        }, 100);
    };

    // Return to menu
    const returnToMenu = () => {
        if (phaserGameRef.current) {
            phaserGameRef.current.destroy(true);
        }
        setGamePhase('menu');
        setCurrentDrill(null);
        speechSynthesis.cancel();
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
            }
            speechSynthesis.cancel();
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-lg">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🚨 Emergency Drill Simulator
                </h1>
                <p className="text-gray-600">Interactive training for fire and earthquake safety</p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        speechEnabled 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                >
                    {speechEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
                </button>
                
                {gamePhase === 'playing' && (
                    <button
                        onClick={returnToMenu}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                        🏠 Return to Menu
                    </button>
                )}
            </div>

            {/* Menu */}
            {gamePhase === 'menu' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Fire Drill */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6 text-center">
                        <div className="text-6xl mb-4">🔥</div>
                        <h2 className="text-2xl font-bold text-red-700 mb-3">Fire Drill</h2>
                        <p className="text-red-600 mb-6">
                            Practice fire evacuation procedures. Learn to check doors, 
                            stay low, and find safe exits quickly.
                        </p>
                        <button
                            onClick={() => startDrill('fire')}
                            className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-red-600 transition-colors transform hover:scale-105"
                        >
                            Start Fire Drill
                        </button>
                    </div>

                    {/* Earthquake Drill */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6 text-center">
                        <div className="text-6xl mb-4">🌍</div>
                        <h2 className="text-2xl font-bold text-orange-700 mb-3">Earthquake Drill</h2>
                        <p className="text-orange-600 mb-6">
                            Master "Drop, Cover, and Hold On". Learn to protect yourself 
                            during earthquakes and take appropriate shelter.
                        </p>
                        <button
                            onClick={() => startDrill('earthquake')}
                            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors transform hover:scale-105"
                        >
                            Start Earthquake Drill
                        </button>
                    </div>
                </div>
            )}

            {/* Game Container */}
            {gamePhase === 'playing' && (
                <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border-4 border-gray-700">
                    <div ref={gameRef} className="w-full flex justify-center"></div>
                </div>
            )}

            {/* Instructions */}
            {gamePhase === 'menu' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🎮 How to Play:</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Use arrow keys or WASD to move your character</li>
                        <li>• Listen carefully to voice instructions</li>
                        <li>• Click on highlighted objects when prompted</li>
                        <li>• Press SPACE to advance through instructions</li>
                        <li>• Follow emergency procedures to earn points</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DrillGameSimple;