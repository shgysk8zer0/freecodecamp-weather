import './std-js/shims.js';
import './std-js/deprefixer.js';
import {$, ready} from './std-js/functions.js';
import Weather from './weather.js';
import {icons} from './consts.js';

function isNightTime(weather) {
	return ! isDayTime(weather);
}

function isDayTime(weather) {
	const date = new Date();
	const unixTime = (date.getTime() + date.getTimezoneOffset() * 60) / 1000;
	return unixTime > weather.sys.sunrise && unixTime < weather.sys.sunset;
}

function convertTemp() {
	const temp = parseFloat(this.textContent);
	if (this.dataset.sys.toLowerCase() === 'c') {
		this.dataset.sys = 'f';
		this.textContent = (9 / 5 * temp + 32).toFixed(2);
	} else {
		this.dataset.sys = 'c';
		this.textContent = (5 / 9 * (temp - 32)).toFixed(2);
	}
}

async function updateWeather() {
	const weather = await Weather.getFromLocation();
	const template = document.getElementById('weather-template').content.cloneNode(true);
	const isNight = isNightTime(weather);
	const cond = weather.weather[0].main;
	const main = document.querySelector('main');
	$(main.children).remove();

	$('[data-prop="city"]', template).text(weather.name);
	$('[data-prop="country"]', template).text(weather.sys.country);
	$('[data-prop="temp"]', template).text((9 / 5 * weather.main.temp + 32).toFixed(2));
	$('[data-prop="condition"]', template).text(cond);
	$('.weather-icon', template).each(icon => {
		icon.dataset.weatherCondition = cond;
		const use = icon.querySelector('use');
		const href = new URL(use.getAttribute('xlink:href'), location.href);
		let symbol = icons[cond.replace(' ', '-').toLowerCase()] || 'severe-alert';

		href.hash = isNight && symbol.hasOwnProperty('night') ? symbol.night : symbol.day;
		use.setAttribute('xlink:href', href);
	});

	main.append(template);
	$('[data-prop="temp"]').click(convertTemp);
}

ready().then(() => {
	updateWeather().then(() => {
		$('.cursor-wait').removeClass('cursor-wait');
		$('.js-update').click(updateWeather).then($btn => $btn.attr({disabled: false}));
		setInterval(updateWeather, 60 * 30 * 1000);
	}).catch(() => {
		$('.error-message').removeClass('hidden');
		$('.cursor-wait').removeClass('cursor-wait');
	});
});
