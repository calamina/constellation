import { gsap } from "gsap";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import data from './assets/data.json';
import type { Star, StarData } from "./models";
import { space } from './space';
import { DOM, isMobile } from "./utils";
gsap.registerPlugin(ScrambleTextPlugin)

const { animate, slowRotate, core, isInteractingControls, isCoreActive, swingFrontStar, replaceStar, raycastClick, raycastHover, getCameraPosition, setCoreOpacity, stars } = space();

stars.forEach((star, index) => star.data = data[index])
let activeStar: Star = stars[0]

// EVENTS
window.addEventListener('pointerdown', raycastCore)
window.addEventListener('pointermove', raycastCoreInfo);
DOM.next?.addEventListener("click", next)
DOM.previous?.addEventListener("click", previous)
document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowLeft") previous()
  else if (event.key === "ArrowRight") next()
});

function next() {
  const index = stars.indexOf(activeStar)
  const nextStar = stars[index === stars.length - 1 ? 0 : index + 1]
  moveStars("next", nextStar)
}

function previous() {
  const index = stars.indexOf(activeStar)
  const prevStar = stars[index === 0 ? stars.length - 1 : index - 1]
  moveStars("prev", prevStar)
}

function setData(data: StarData | undefined) {
  if (!data || !DOM.index) return
  const tl = gsap.timeline({
    defaults: {
      duration: 0.3,
      scrambleText: { text: "", tweenLength: false, chars: "lowerCase" }
    }
  })
  tl.call(() => { DOM.index.innerHTML = data.index.toString() });

  setInfo(tl, data);
  setUnits(tl, data);
  setTopology(data);
}

function setTopology(data: StarData) {
  const topos = Array.from(DOM.topology?.children ?? []);
  topos.forEach(el => el.classList.add('topohidden'));
  topos[data.index - 1].classList.remove('topohidden');
}

function setUnits(tl: gsap.core.Timeline, data: StarData) {
  DOM.units?.forEach((unit, index) =>
    tl.to(unit, {
      scrambleText: { text: '_:0' + data.units[index].toString(), },
    }, 0));
}

function setInfo(tl: gsap.core.Timeline, data: StarData) {
  const elements = getInfoElements();
  elements.forEach(element =>
    tl.to(element.elt, {
      scrambleText: { text: data[element.name]?.toString() },
    }, 0)
  );
}

function getInfoElements(): { name: keyof StarData; elt: Element }[] {
  const titleElements = Array.from(DOM.main?.children ?? [])
  const infoElements = Array.from(DOM.type?.children ?? [])
  const [name, scientific, galaxy] = titleElements
  const [distance, type, inhab] = infoElements

  return [
    { name: "name", elt: name },
    { name: "scientific", elt: scientific },
    { name: "galaxy", elt: galaxy },
    { name: "distance", elt: distance },
    { name: "type", elt: type },
    { name: "inhab", elt: inhab },
  ]
}

function setColor(selectedStar?: Star) {
  const star = selectedStar ?? activeStar
  if (!star.data) return
  DOM.root?.style.setProperty('--color', star.data.color);
  DOM.root?.style.setProperty('--hue', star.data.hue + "deg");
  // DOM.root?.style.setProperty('--borderColor', star.data.borderColor);
}

function moveStars(direction: "prev" | "next", star: Star) {
  setCoreOpacity(1);
  setColor(star);
  setData(star.data);

  const tl: GSAPTimeline = gsap.timeline({ defaults: { duration: 0.25, ease: "power3.inOut" } });
  tl
    .to(DOM.indexBox, {
      translateX: direction === "prev" ? "1rem" : "-1rem",
      ease: "power3.out",
      duration: 0.35,
    })
    .to(DOM.indexBox, {
      translateX: 0,
      ease: "back.out",
    }, 0.35)
    .to(DOM.symbol, {
      marginTop: direction === "next" ? "1.5rem" : "-1.5rem",
      ease: "power3.out",
      duration: 0.35
    }, 0)
    .to(DOM.symbol, {
      marginTop: "0",
      ease: "back.out",
    }, 0.35)
    .to([...stars.map(star => star.model.scale)], {
      x: 0, y: 0, z: 0,
      onComplete: () => replaceStar(activeStar, star, () => setStar(star))
    }, 0)
    .to([...stars.map(star => star.model.scale)],
      { x: 1, y: 1, z: 1 },
      0.25)
}

function setStar(star: Star) {
  activeStar = star
}

function raycastCore(e: MouseEvent) {
  raycastClick(e, core, () => {
    swingFrontStar(activeStar)
    toggleCore()
  })
}

function toggleCore() {
  if (!isCoreActive()) {
    setColor()
    setCoreOpacity(1)
    timeAnimations(1)
  } else {
    DOM.root?.style.setProperty('--color', 'transparent');
    setCoreOpacity(0.11)
    timeAnimations(0.1)
  }
}

function timeAnimations(time: number) {
  const animationNames = ["orbit", "pulse", "baranim", "lineanim"];
  DOM.animations?.forEach((animation: CSSAnimation) => {
    if (animationNames.includes(animation.animationName))
      animation.playbackRate = time;
  })
}

function raycastCoreInfo(e: MouseEvent) {
  raycastHover(e, core,
    function mouseIn() {
      DOM.body!.style.cursor = "pointer"
      DOM.coreFocus!.style.opacity = '1';
      DOM.danger!.style.display = "none";
      [...DOM.path, DOM.topology].forEach((el) => el?.classList.add("activated"))
    },
    function mouseOut() {
      DOM.body!.style.cursor = "default"
      DOM.coreFocus!.style.opacity = '0';
      DOM.danger!.style.display = "flex";
      [...DOM.path, DOM.topology].forEach((el) => el?.classList.remove("activated"));
    })
}

function updateUI() {
  const coreFocusVisible = DOM.coreFocus?.style.opacity === "1";
  const coreDisabled = !isCoreActive()

  coreDisabled || coreFocusVisible || isInteractingControls ?
    setUIForDisabledCore(coreDisabled) :
    setUIForActiveCore();
}

function setUIForActiveCore() {
  DOM.danger!.style.display = "flex";
  DOM.control!.style.display = "none";
  [...DOM.coords].forEach(coord => coord.style.display = "flex");
  activeStar.rotate();
}

function setUIForDisabledCore(coreDisabled: boolean) {
  DOM.danger!.style.display = "none";
  if (coreDisabled) {
    DOM.control!.style.display = "flex";
    [...DOM.coords].forEach(coord => coord.style.display = "none");
    slowRotate(activeStar);
  }
}

function animateCoords() {
  const symbols = ['ϰ', 'λ', 'ϟ']
  setInterval(() => {
    const ref = getCameraPosition()
    DOM.coords.forEach((coord, index) =>
      gsap.to(coord, {
        scrambleText: {
          text: symbols[index] + "_" + ref[index],
          chars: "0123456798",
          revealDelay: 0.2
        },
        duration: 0.5
      }))
    const date = new Date(Date.now() + 32123456789099)
    const formated = `α:_ 0εx${date.getSeconds()}`
    DOM.timedate!.innerHTML = formated
  }, 1500)
}

function animateGraphData() {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.15 })
  tl.to(DOM.graphData, {
    scrambleText: {
      text: "⠥⠏⠺⠁⠗⠙⠎",
      chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
      revealDelay: 1
    },
    duration: 2,
  }, 0)
}

function animateSuccess() {
  const tl = gsap.timeline({ repeat: -1 })
  tl
    .to(DOM.controlText, {
      scrambleText: {
        text: "core recharged ⠞ [(under control)]",
        chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
      },
      duration: 3,
    })
    .to(DOM.controlText, {
      scrambleText: {
        text: "core recharged ⠞ [(under control)]",
        chars: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠭⠽⠵",
        rightToLeft: true
      },
      reversed: true,
      duration: 3,
    })
}

function animateData() {
  animateSuccess();
  animateCoords();
  animateGraphData()
}

function fade() {
  const tl = gsap.timeline({ defaults: { duration: .3 } });
  tl
    .set(DOM.ui, {
      scaleY: 0,
    })
    .set(DOM.ctrl, {
      scaleY: 0,
      opacity: 0
    })
    .set(["p", ".horisep"], {
      opacity: 0
    })
    .set(DOM.coreFocus, {
      display: "none"
    })

  tl
    .to(DOM.body, { autoAlpha: 1, })
    .to(DOM.load, {
      width: isMobile ? "calc(100vw - 1rem)" : "40vw",
      duration: 0.8,
      delay: 0.2,
      ease: "power1.out"
    })
    .to(DOM.num, {
      textContent: 100,
      snap: { textContent: 1 },
      duration: 0.8,
      ease: "power1.out"
    }, "<")
    .to(DOM.load, {
      autoAlpha: 0,
      display: "none",
      duration: 0
    })
    .to(DOM.ui, {
      scaleY: 1,
      duration: 0.7,
      ease: "power2.out"
    })
    .to(DOM.ctrl, {
      scaleY: 1,
      opacity: 1
    }, "< 0.25")
    .to(["p", ".horisep", "span"], {
      opacity: 1
    }, "< -0.1")
    .to(DOM.coreFocus, {
      display: "grid"
    }, "< -0.1")
}

// INIT
setTimeout(() => {
  fade()
  animate(updateUI)
  animateData()
}, 4)

