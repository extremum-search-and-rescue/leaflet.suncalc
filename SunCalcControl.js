function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}
Date.prototype.addDays = function (days) {
    return new Date(this.getTime() + (days * 24 * 60 * 60 * 1000));
};
Date.prototype.addHours = function (hours) {
    return new Date(this.getTime() + (hours * 60 * 60 * 1000));
};
Date.prototype.addMinutes = function (minutes) {
    return new Date(this.getTime() + (minutes * 60 * 1000));
};
Date.prototype.isValid = function (d) {
    return isValidDate(d);
};
var L;
(function (L) {
    let Control;
    (function (Control) {
        class SunCalcControlOptions {
            constructor() {
                this.position = 'middlecenter';
                this.sunRadius = 13;
                this.moonRadius = 6;
            }
        }
        Control.SunCalcControlOptions = SunCalcControlOptions;
        class SunCalcControl extends L.Control {
            constructor(options) {
                options = Object.assign(Object.assign({}, new SunCalcControlOptions()), options);
                super(options);
                this._previousCenter = null;
                this._previousDate = null;
                this.isVisible = false;
                this._container = null;
            }
            hide(e) {
                if (e.layer && e.layer.options && e.layer.options.id === 'SC') {
                    this.isVisible = false;
                    const div = document.querySelector('.suncalc-control');
                    div.innerHTML = '';
                }
            }
            show(e) {
                if (e.layer && e.layer.options && e.layer.options.id === 'SC') {
                    this.isVisible = true;
                    this.updateSunMoonCalc();
                }
                ;
            }
            _updateSunMoonCalcOnMoveDelayed() {
                setTimeout(() => this._updateSunMoonCalcOnMove(), 300);
            }
            _updateSunMoonCalcOnMove() {
                if (!this._map.hasLayer(suncalc))
                    return;
                const mapCenter = this._map.wrapLatLng(this._map.getCenter());
                const distance = mapCenter.distanceTo(this._previousCenter);
                const currentDate = new Date();
                const timeDiffInSeconds = (currentDate - this._previousDate) / 1000;
                if (distance < 5000 && timeDiffInSeconds < 60)
                    return;
                this._map.sunCalcControl.refesh(SunCalc.getTimes(currentDate, mapCenter.lat, mapCenter.lng), SunCalc.getMoonTimes(currentDate, mapCenter.lat, mapCenter.lng), mapCenter);
                this._previousCenter = mapCenter;
                this._previousDate = currentDate;
            }
            updateSunMoonCalc() {
                if (!this._map.hasLayer(suncalc))
                    return;
                const mapCenter = this._map.wrapLatLng(this._map.getCenter());
                const currentDate = new Date();
                this._map.sunCalcControl.refesh(SunCalc.getTimes(currentDate, mapCenter.lat, mapCenter.lng), SunCalc.getMoonTimes(currentDate, mapCenter.lat, mapCenter.lng), mapCenter);
                this._previousCenter = mapCenter;
                this._previousDate = currentDate;
            }
            onAdd(map) {
                if (!window.SunCalc)
                    throw new Error("SunCalcControl requires SunCalc.js to be added to window global object");
                this._map = map;
                map.sunCalcControl = this;
                map.on('moveend', this._updateSunMoonCalcOnMoveDelayed, this);
                map.on('zoomend', this._updateSunMoonCalcOnMoveDelayed, this);
                map.on('themechanged', this.updateSunMoonCalc, this);
                map.on('overlayadd', this.show, this);
                map.on('overlayremove', this.hide, this);
                map.on('resize', this._updateSunMoonCalcOnMoveDelayed, this);
                if (map.hasLayer(suncalc))
                    this.isVisible = true;
                this._container = L.DomUtil.create('div', 'suncalc-control suncalc');
                this._container.style.top = '50%';
                this._container.style.left = '50%';
                this._container.style.transform = 'translate(-50%,-50%)';
                this._container.style.position = 'absolute';
                setInterval(() => {
                    if (this.isVisible && (Math.abs(new Date() - this._previousDate) / 1000) > 60)
                        this.updateSunMoonCalc();
                }, 60000);
                map.whenReady(this.updateSunMoonCalc, this);
                return this._container;
            }
            onRemove(map) {
            }
            refesh(sunTimes, moonTimes, latlng) {
                if (!this._map.hasLayer(suncalc)) {
                    this._container.innerHTML = '';
                }
                else {
                    const circleSize = this.circleSize = L.Browser.mobile ? Math.min(window.screen.availWidth, window.screen.availHeight) - 80 : 500;
                    const controlMargin = this.controlMargin = L.Browser.mobile ? 15 : 20;
                    const fullControlSize = this.fullControlSize = this.circleSize + this.controlMargin * 2;
                    const halfSize = this.halfSize = circleSize / 2;
                    const sunRadius = this.options.sunRadius;
                    const moonRadius = this.options.moonRadius;
                    const theme = `gis-theme-${this._map.options.baseLayerTheme}`;
                    const sunBackgroundEffects = `<filter id="filter0_d" x="0" y="0" width="${fullControlSize}" height="${fullControlSize}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset/><feGaussianBlur stdDeviation="10"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.72 0 0 0 0 0 0 0 0 1 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter>`;
                    const azimuthBackgroundEffects = `<filter id="filter1_d" x="0" y="0" width="${fullControlSize}" height="${fullControlSize}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset/><feGaussianBlur stdDeviation="5"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter>`;
                    let moonCircle = '';
                    let sunCircle = '';
                    let sunAzimuth = '';
                    const dawn = sunTimes['dawn'];
                    const sunrise = sunTimes['sunrise'];
                    const sunset = sunTimes['sunset'];
                    const dusk = sunTimes['dusk'];
                    const currentTime = new Date();
                    const sunPosition = SunCalc.getPosition(currentTime, latlng.lat, latlng.lng);
                    const moonPosition = SunCalc.getMoonPosition(currentTime, latlng.lat, latlng.lng);
                    if (moonPosition.altitude > -0.1) {
                        const moonX = halfSize + (halfSize - (halfSize / 2 + moonRadius) * moonPosition.altitude) * Math.cos(moonPosition.azimuth + Math.PI / 2);
                        const moonY = halfSize + (halfSize - (halfSize / 2 + moonRadius) * moonPosition.altitude) * Math.sin(moonPosition.azimuth + Math.PI / 2);
                        const moonIllumination = SunCalc.getMoonIllumination(currentTime);
                        moonCircle = `<circle class="gis-themeaware suncalc-moon ${theme}" cx="${moonX}" cy="${moonY}" r="${moonRadius}" opacity="${moonIllumination.fraction.toFixed(2)}" class="suncalc-moon"></circle>`;
                    }
                    if ((currentTime >= dawn && currentTime <= dusk) || sunPosition.altitude > 0) {
                        const sunX = halfSize + (halfSize - (halfSize / 2 + sunRadius) * sunPosition.altitude) * Math.cos(sunPosition.azimuth + Math.PI / 2);
                        const sunY = halfSize + (halfSize - (halfSize / 2 + sunRadius) * sunPosition.altitude) * Math.sin(sunPosition.azimuth + Math.PI / 2);
                        sunAzimuth = this.polylineForTimeAndPlace(currentTime, latlng, 'azimuth');
                        sunCircle = `<g filter="url(#filter0_d)"><circle class="gis-themeaware suncalc-sun ${theme}" cx="${sunX}" cy="${sunY}" r="${sunRadius}" id="suncalc-sun"></circle></g>`;
                    }
                    const sunPathClip = `<clipPath id="mask1"><polygon points="${this.getPathClipPoints(sunrise, sunset, SunCalc.getPosition, latlng, sunRadius * 2 + 4).join(' ')}" /></clipPath>`;
                    const moonPathClip = `<clipPath id="mask2"><polygon points="${this.getPathClipPoints(moonTimes['rise'], moonTimes['set'], SunCalc.getMoonPosition, latlng, moonRadius * 2 + 4).join(' ')}" /></clipPath>`;
                    const azimuthCircle = `<g filter="url(#filter1_d)"><circle class="gis-themeaware suncalc-azimuth-circle ${theme}" cx="${halfSize}" id="azimuthCircle" cy="${halfSize}" r="${halfSize}"></circle></g>`;
                    const sunPathCircle = `${sunPathClip}<circle class="gis-themeware suncalc-sun-path ${theme}" clip-path="url(#mask1)" id="sunPath" cx="${halfSize}" cy="${halfSize}" r="${halfSize + 4}"/>`;
                    const moonPathCircle = `${moonPathClip}<circle class="gis-themeaware suncalc-moon-path ${theme}" clip-path="url(#mask2)" cx="${halfSize}" cy="${halfSize}" r="${halfSize - 4}" id="moonPath"/>`;
                    const svgCode = [
                        `<svg class="suncalc" width="${fullControlSize}" height="${fullControlSize}" xmlns="http://www.w3.org/2000/svg" overflow="visible" viewBox="0 0 ${fullControlSize} ${fullControlSize}">`,
                        this.getSvgTextLabel(dusk, SunCalc.getPosition(dusk, latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded'),
                        this.getSvgTextLabel(dawn, SunCalc.getPosition(dawn, latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded'),
                        this.getSvgTextLabel(this.getDateForHour(0), SunCalc.getPosition(this.getDateForHour(0), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(3), SunCalc.getPosition(this.getDateForHour(3), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(6), SunCalc.getPosition(this.getDateForHour(6), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(9), SunCalc.getPosition(this.getDateForHour(9), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(12), SunCalc.getPosition(this.getDateForHour(12), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(15), SunCalc.getPosition(this.getDateForHour(15), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(18), SunCalc.getPosition(this.getDateForHour(18), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(this.getDateForHour(21), SunCalc.getPosition(this.getDateForHour(21), latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded', sunrise, sunset),
                        this.getSvgTextLabel(sunrise, SunCalc.getPosition(sunrise, latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded'),
                        this.getSvgTextLabel(sunset, SunCalc.getPosition(sunset, latlng.lat, latlng.lng), `suncalc-sun-label ${theme}`, 'suncalc-shaded'),
                        `<svg class="suncalc" x="${controlMargin}" y="${controlMargin}" width="${circleSize}" height="${circleSize}" xmlns="http://www.w3.org/2000/svg" overflow="visible" viewBox="0 0 ${circleSize} ${circleSize}">`,
                        azimuthCircle,
                        sunPathCircle,
                        moonPathCircle,
                        sunAzimuth,
                        sunCircle,
                        moonCircle,
                        `<defs>${sunBackgroundEffects}${azimuthBackgroundEffects}</defs>`,
                        '</svg>',
                        '</svg>'
                    ];
                    this._container.innerHTML = svgCode.join(' ');
                }
            }
            getSvgTextLabel(date, position, cls, shadedCls, startTime, endTime) {
                if (!isValidDate(date) || date > endTime || date < startTime)
                    return '';
                const xy = this.getXY(position, 20);
                return `<text class="${cls}${position.altitude < -0.1 ? ` ${shadedCls}` : ''}" x="${xy.x}" y="${xy.y}">${date.getHours().pad(2)}:${date.getMinutes().pad(2)}</text>`;
            }
            getTimesFromDuskTillDown(start, end) {
                const times = [];
                start = isValidDate(start) ? start : this.getDateForHour(0);
                end = isValidDate(end) ? end : this.getDateForHour(23);
                if (start > end)
                    end = end.addDays(1);
                for (let date = start; date < end; date = date.addMinutes(15)) {
                    times.push(date);
                }
                return times;
            }
            getXYforTimes(times, positionFunction, latlng, offset) {
                const xy = [];
                for (let i = 0; i < times.length; i++) {
                    xy.push(this.getXY(positionFunction(times[i], latlng.lat, latlng.lng), offset));
                }
                return xy;
            }
            getPathClipPoints(dawn, dusk, positionFunction, latlng, offset) {
                const points = [];
                const xy = this.getXYforTimes(this.getTimesFromDuskTillDown(dawn, dusk), positionFunction, latlng, offset);
                for (let i = 0; i < xy.length; i++) {
                    points.push(`${xy[i].x},${xy[i].y}`);
                }
                points.push(`${this.halfSize},${this.halfSize}`);
                return points;
            }
            polylineForTimeAndPlace(time, latlng, cssclass, timeEnd, tooltipContent) {
                if (!isValidDate(time) || !isValidDate(timeEnd))
                    return '';
                const x = this.halfSize * Math.cos(SunCalc.getPosition(time, latlng.lat, latlng.lng).azimuth + Math.PI / 2);
                const y = this.halfSize * Math.sin(SunCalc.getPosition(time, latlng.lat, latlng.lng).azimuth + Math.PI / 2);
                const titleTag = typeof tooltipContent !== 'undefined' ? `<title>${tooltipContent}</title>` : '';
                if (timeEnd) {
                    const x1 = this.halfSize * Math.cos(SunCalc.getPosition(timeEnd, latlng.lat, latlng.lng).azimuth + Math.PI / 2);
                    const y1 = this.halfSize * Math.sin(SunCalc.getPosition(timeEnd, latlng.lat, latlng.lng).azimuth + Math.PI / 2);
                    return `<polyline class="suncalc-${cssclass}" points='${this.halfSize},${this.halfSize} ${this.halfSize + Math.round(x)},${this.halfSize + Math.round(y)} ${300 + Math.round(x1)},${300 + Math.round(y1)}'>${titleTag}</polyline>`;
                }
                else
                    return `<polyline class="suncalc-${cssclass}" points='${this.halfSize},${this.halfSize} ${this.halfSize + Math.round(x)},${this.halfSize + Math.round(y)}'>${titleTag}</polyline>`;
            }
            getXY(position, modificator) {
                const retval = new L.Point(0, 0);
                const offset = modificator ? modificator : 0;
                retval.x = Math.round((this.circleSize / 2 + this.controlMargin) + ((this.circleSize / 2 + offset) * Math.cos(position.azimuth + Math.PI / 2)));
                retval.y = Math.round((this.circleSize / 2 + this.controlMargin) + ((this.circleSize / 2 + offset) * Math.sin(position.azimuth + Math.PI / 2)));
                return retval;
            }
            getDateForHour(hour) {
                const currentTime = new Date();
                return new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hour, 0);
            }
        }
        Control.SunCalcControl = SunCalcControl;
        ;
    })(Control = L.Control || (L.Control = {}));
    let control;
    (function (control) {
        function suncalc(options) {
            return new L.Control.SunCalcControl(options);
        }
        control.suncalc = suncalc;
    })(control = L.control || (L.control = {}));
})(L || (L = {}));
