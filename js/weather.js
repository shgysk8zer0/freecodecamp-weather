import {getLocation} from './std-js/functions.js';
import {ENDPOINT} from './consts.js';

export default class Weather {
	static async getFromLocation(key, {
		enableHighAccuracy = true,
		timeout            = 1500,
		maximumAge         = 3600,
		units              = 'imperial',
	} = {}) {
		const pos = await getLocation({enableHighAccuracy, timeout, maximumAge});
		const url = new URL(ENDPOINT);
		url.searchParams.set('appid', key);
		url.searchParams.set('units', units);
		url.searchParams.set('lat', pos.coords.latitude);
		url.searchParams.set('lon', pos.coords.longitude);
		const resp = await fetch(url);
		if (resp.ok) {
			return resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}
}
