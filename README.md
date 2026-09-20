# 🧪 Virtual Chemistry Lab

A 3D interactive chemistry laboratory where students can **enter a virtual lab, interact with equipment, and perform chemistry experiments** in an immersive environment.

> 🚧 This project is currently under active development.

## What is it?

Virtual Chemistry Lab is a web-based 3D laboratory designed for Class 11–12 students.

Instead of only reading the steps of an experiment, students can actually **walk around the lab, pick up equipment, place it on workstations, and perform experiments virtually**.

The long-term goal is to turn it into a **multiplayer virtual classroom**, where a teacher can demonstrate an experiment and students can perform it themselves while receiving guidance and feedback.

## ✨ Features

### 🏫 Virtual Lab
- Interactive 3D chemistry classroom
- Student workstations
- Teacher demonstration workstation
- Laboratory equipment and safety setup

### 👤 Player
- First-person view
- Third-person view
- POV switching
- WASD movement
- Sprint
- Mouse look
- Collision detection

### 🧪 Equipment
Currently working with:
- Beaker
- Conical Flask
- Test Tube
- Burette

Students can:
- Inspect equipment
- Pick up equipment
- Move equipment
- Place equipment on valid surfaces
- Get feedback when placement is invalid

### ⚗️ Chemistry System
The lab is being built around a reusable chemistry system that will allow equipment to have real chemical states such as:

- Volume
- Chemical contents
- Concentration
- Solution colour
- Temperature

This will eventually allow actions such as:

`Pour → Measure → Mix → Heat → Add Reagent`

## 🎯 First Major Experiment

The first complete experiment planned for the lab is:

**Acid–Base Titration**

Students will eventually be able to:

1. Prepare the apparatus
2. Fill the burette
3. Add indicator
4. Perform the titration
5. Observe the colour change
6. Determine the endpoint
7. Calculate the result

## 🚀 Future Plans

The project will gradually evolve into a multiplayer virtual chemistry classroom.

Planned features include:

- 👨‍🏫 Teacher mode
- 👨‍🎓 Student mode
- 🌐 Multiplayer laboratory
- 👥 Shared student avatars
- 🎤 Voice communication
- 🧪 More chemistry experiments
- ⚠️ Mistake detection
- 📊 Automatic assessment
- 💬 Real-time teacher guidance

## 🛠️ Built With

- **React**
- **Vite**
- **Three.js**
- **React Three Fiber**
- **React Three Drei**

Planned:

- Node.js
- Express
- Socket.IO
- WebRTC
- MongoDB

## ▶️ Run Locally

Clone the repository:

```bash
git clone https://github.com/ahumangurmil/3d-virtual-lab.git
