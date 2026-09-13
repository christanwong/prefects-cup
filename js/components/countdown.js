import { HOUSES } from "../config.js";

export function createCountdown(element) {
  let timer = null;

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function render(deadline, totals) {
    stop();

    if (!deadline) {
      element.textContent = "The countdown has not been set yet.";
      return;
    }

    if (deadline - Date.now() > 0) {
      const tick = () => { element.textContent = remainingText(deadline); };
      tick();
      timer = setInterval(tick, 1000);
    } else {
      element.textContent = winnerText(totals);
    }
  }

  return { render, stop };
}

function remainingText(deadline) {
  const t = deadline - Date.now();
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return `The winner will be announced in ${days} Days, ${hours} Hours, ${minutes} Minutes, and ${seconds} Seconds!`;
}

function winnerText(totals) {
  if (!totals) return "The winner will be announced soon!";

  let winner = null;
  for (const house of HOUSES) {
    const value = Number(totals[house.key]) || 0;
    if (!winner || value > winner.value) {
      winner = { label: house.label, value };
    }
  }

  if (!winner || winner.value === 0) return "The winner will be announced soon!";
  return `This year's winner is ${winner.label} House with ${winner.value} points!`;
}
