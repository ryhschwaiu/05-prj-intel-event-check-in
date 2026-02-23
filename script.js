// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendanceTracker = document.querySelector(".attendance-tracker");

// Track attendance
let count = 0;
const maxCount = 50;

// Helper function to calculate percentage
function calculatePercentage() {
  return Math.min(Math.round((count / maxCount) * 100), 100);
}

function getTeamCounts() {
  return {
    water: parseInt(document.getElementById("waterCount").textContent),
    zero: parseInt(document.getElementById("zeroCount").textContent),
    power: parseInt(document.getElementById("powerCount").textContent),
  };
}

// Local Storage Functions
function saveToLocalStorage() {
  const percentage = calculatePercentage();
  const goalReached = percentage === 100;

  const teamCounts = getTeamCounts();
  const data = {
    totalCount: count,
    waterCount: teamCounts.water,
    zeroCount: teamCounts.zero,
    powerCount: teamCounts.power,
    waterAttendees: getAttendeeList("water"),
    zeroAttendees: getAttendeeList("zero"),
    powerAttendees: getAttendeeList("power"),
    goalReached: goalReached,
    winnerKeys: goalReached ? getWinnerKeys() : [],
  };
  localStorage.setItem("attendanceData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem("attendanceData");

  if (savedData) {
    const data = JSON.parse(savedData);

    // Restore total count
    count = data.totalCount || 0;
    document.getElementById("attendeeCount").textContent = count;

    // Restore team counts
    document.getElementById("waterCount").textContent = data.waterCount || 0;
    document.getElementById("zeroCount").textContent = data.zeroCount || 0;
    document.getElementById("powerCount").textContent = data.powerCount || 0;

    // Restore attendee lists
    restoreAttendeeList("water", data.waterAttendees || []);
    restoreAttendeeList("zero", data.zeroAttendees || []);
    restoreAttendeeList("power", data.powerAttendees || []);

    // Update progress bar
    const percentage = calculatePercentage();
    document.getElementById("progressBar").style.width = percentage + "%";

    // Restore celebration state if goal was reached
    if (data.goalReached && data.winnerKeys && data.winnerKeys.length > 0) {
      const winnerKeys = data.winnerKeys;
      const winnerNames = getWinnerNames(winnerKeys);
      const message = `🎊 Attendance goal reached! Congratulations, ${winnerNames}!`;
      const greeting = document.getElementById("greeting");

      // Apply winner class to team cards
      winnerKeys.forEach(function (key) {
        const winnerCard = document.querySelector(`.team-card.${key}`);
        if (winnerCard) {
          winnerCard.classList.add("winner");
        }
      });

      // Apply winner style to greeting message
      greeting.classList.add(
        "winner",
        winnerKeys[0],
        "success-message",
        "is-visible",
      );
      greeting.textContent = message;
    }
  }
}

function getAttendeeList(teamKey) {
  const attendeeList = document.getElementById(`${teamKey}List`);
  const items = attendeeList.querySelectorAll(".team-attendee-item");
  const names = [];

  items.forEach(function (item) {
    names.push(item.textContent);
  });

  return names;
}

function restoreAttendeeList(teamKey, attendees) {
  const attendeeList = document.getElementById(`${teamKey}List`);

  // Clear existing items
  attendeeList.innerHTML = "";

  // Add each attendee back to the list
  attendees.forEach(function (name) {
    const listItem = document.createElement("li");
    listItem.classList.add("team-attendee-item");
    listItem.textContent = name;
    attendeeList.appendChild(listItem);
  });
}

// Load saved data when the page loads
loadFromLocalStorage();

function getWinnerKeys() {
  const counts = getTeamCounts();
  const highestCount = Math.max(counts.water, counts.zero, counts.power);
  const winnerKeys = [];

  if (counts.water === highestCount) winnerKeys.push("water");
  if (counts.zero === highestCount) winnerKeys.push("zero");
  if (counts.power === highestCount) winnerKeys.push("power");

  return winnerKeys;
}

function getWinnerNames(winnerKeys) {
  const teamMap = {
    water: "Team Water Wise",
    zero: "Team Net Zero",
    power: "Team Renewables",
  };

  const names = winnerKeys.map(function (key) {
    return teamMap[key];
  });

  if (names.length === 1) {
    return names[0];
  }

  return names.join(" and ");
}

function addAttendeeToList(attendeeName, teamKey) {
  const attendeeList = document.getElementById(`${teamKey}List`);
  const listItem = document.createElement("li");

  listItem.classList.add("team-attendee-item");
  listItem.textContent = attendeeName;

  attendeeList.insertBefore(listItem, attendeeList.firstChild);
}

function pulseElement(element) {
  if (!element) {
    return;
  }

  element.classList.remove("pulse");
  void element.offsetWidth;
  element.classList.add("pulse");
}

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(`Attendee Name: ${name}, ${teamName}`);

  // Increment count
  count++;
  console.log(`Current check-ins: ${count}`);

  // Update progress bar
  const percentage = calculatePercentage();
  document.getElementById("progressBar").style.width = percentage + "%";

  // Update attendance count
  const attendeeCount = document.getElementById("attendeeCount");
  attendeeCount.textContent = count;

  // Update team counter
  const teamCounter = document.getElementById(`${team}Count`);
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;
  const teamCard = document.querySelector(`.team-card.${team}`);
  pulseElement(teamCard);

  // Add attendee to list
  addAttendeeToList(name, team);

  // Save all data to local storage
  saveToLocalStorage();

  // Show welcome or celebration message
  let message = `🎉 Welcome, ${name} from ${teamName}!`;
  const greeting = document.getElementById("greeting");

  if (percentage === 100) {
    const winnerKeys = getWinnerKeys();
    const winnerNames = getWinnerNames(winnerKeys);
    message = `🎊 Attendance goal reached! Congratulations, ${winnerNames}!`;
    winnerKeys.forEach(function (key) {
      const winnerCard = document.querySelector(`.team-card.${key}`);
      if (winnerCard) {
        winnerCard.classList.add("winner");
      }
    });

    // Apply winner style to greeting message based on first winning team
    const firstWinnerKey = winnerKeys[0];
    greeting.classList.add("winner", firstWinnerKey);

    // Trigger "Fireworks" confetti celebration (Source: https://www.kirilv.com/canvas-confetti/. Optimized by Copilot.)
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.1 + Math.random() * 0.2, y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.7 + Math.random() * 0.2, y: Math.random() - 0.2 },
      });
    }, 250);
  }

  greeting.textContent = message;
  greeting.classList.add("success-message", "is-visible");
  pulseElement(greeting);

  form.reset();
});
