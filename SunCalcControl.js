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
Date.prototype.addSeconds = function (seconds) {
    return new Date(this.getTime() + (seconds * 1000));
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
                const timeDiffInSeconds = (currentDate.valueOf() - this._previousDate.valueOf()) / 1000;
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
                    if (this.isVisible && (Math.abs(new Date().valueOf() - this._previousDate.valueOf()) / 1000) > 60)
                        this.updateSunMoonCalc();
                }, 60000);
                map.whenReady(this.updateSunMoonCalc, this);
                return this._container;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VuQ2FsY0NvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdW5DYWxjQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFdBQVcsQ0FBQyxDQUFnQjtJQUNqQyxPQUFPLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBc0IsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFVRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQVk7SUFDM0MsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUE7QUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLEtBQWE7SUFDN0MsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUMsQ0FBQTtBQUVELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsT0FBZTtJQUNqRCxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDLENBQUE7QUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLE9BQWU7SUFDakQsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUE7QUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQU87SUFDdEMsT0FBTyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBO0FBRUQsSUFBVSxDQUFDLENBK1BWO0FBL1BELFdBQVUsQ0FBQztJQUlQLElBQWlCLE9BQU8sQ0FvUHZCO0lBcFBELFdBQWlCLE9BQU87UUFDcEIsTUFBYSxxQkFBcUI7WUFBbEM7Z0JBQ0ksYUFBUSxHQUFvQixjQUFjLENBQUE7Z0JBQzFDLGNBQVMsR0FBVyxFQUFFLENBQUM7Z0JBQ3ZCLGVBQVUsR0FBVyxDQUFDLENBQUM7WUFDM0IsQ0FBQztTQUFBO1FBSlksNkJBQXFCLHdCQUlqQyxDQUFBO1FBQ0QsTUFBYSxjQUFlLFNBQVEsQ0FBQyxDQUFDLE9BQU87WUFhekMsWUFBWSxPQUErQjtnQkFDdkMsT0FBTyxtQ0FBUSxJQUFJLHFCQUFxQixFQUFFLEdBQUssT0FBTyxDQUFFLENBQUE7Z0JBQ3hELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFabkIsb0JBQWUsR0FBYyxJQUFJLENBQUE7Z0JBQ2pDLGtCQUFhLEdBQVUsSUFBSSxDQUFBO2dCQUMzQixjQUFTLEdBQVksS0FBSyxDQUFBO2dCQUMxQixlQUFVLEdBQW1CLElBQUksQ0FBQTtZQVVqQyxDQUFDO1lBR0QsSUFBSSxDQUFDLENBQTZEO2dCQUM5RCxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDM0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDdkQsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7aUJBQ3RCO1lBQ0wsQ0FBQztZQUNELElBQUksQ0FBQyxDQUE2RDtnQkFDOUQsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQzNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUN0QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztpQkFDNUI7Z0JBQUEsQ0FBQztZQUNOLENBQUM7WUFDRCwrQkFBK0I7Z0JBQzNCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0Qsd0JBQXdCO2dCQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO29CQUFFLE9BQU87Z0JBRXpDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBRS9CLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDeEYsSUFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLGlCQUFpQixHQUFHLEVBQUU7b0JBQUUsT0FBTztnQkFFdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUMzQixPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFDM0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQy9ELFNBQVMsQ0FBQyxDQUFDO2dCQUVmLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztZQUNyQyxDQUFDO1lBRUQsaUJBQWlCO2dCQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7b0JBQUUsT0FBTztnQkFFekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQzNCLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUMzRCxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFDL0QsU0FBUyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO1lBQ3JDLENBQUM7WUFFUSxLQUFLLENBQUUsR0FBVTtnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztnQkFFL0csSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ2hCLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlELEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNyRCxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN6QyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7b0JBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBRWpELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQztnQkFDekQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztnQkFFNUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDYixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQzdGLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUNqQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ1YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUMzQixDQUFDO1lBRUQsTUFBTSxDQUFFLFFBQWdDLEVBQUUsU0FBK0IsRUFBRSxNQUFnQjtnQkFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7aUJBQ2xDO3FCQUFNO29CQUNILE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDakksTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3RFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztvQkFDeEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO29CQUNoRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztvQkFDekMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7b0JBRTNDLE1BQU0sS0FBSyxHQUFHLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBRTlELE1BQU0sb0JBQW9CLEdBQUcsNkNBQTZDLGVBQWUsYUFBYSxlQUFlLHVnQkFBdWdCLENBQUM7b0JBQzduQixNQUFNLHdCQUF3QixHQUFHLDZDQUE2QyxlQUFlLGFBQWEsZUFBZSxxZ0JBQXFnQixDQUFDO29CQUUvbkIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO29CQUNwQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7b0JBQ25CLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztvQkFFcEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM5QixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3BDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUMvQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDN0UsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRWxGLElBQUksWUFBWSxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRTt3QkFDOUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3pJLE1BQU0sS0FBSyxHQUFHLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN6SSxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDbEUsVUFBVSxHQUFHLDhDQUE4QyxLQUFLLFNBQVMsS0FBSyxTQUFTLEtBQUssUUFBUSxVQUFVLGNBQWMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsa0NBQWtDLENBQUM7cUJBQ3RNO29CQUVELElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRTt3QkFDMUUsTUFBTSxJQUFJLEdBQUcsUUFBUSxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ3JJLE1BQU0sSUFBSSxHQUFHLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNySSxVQUFVLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQzFFLFNBQVMsR0FBRyx5RUFBeUUsS0FBSyxTQUFTLElBQUksU0FBUyxJQUFJLFFBQVEsU0FBUyxrQ0FBa0MsQ0FBQztxQkFDM0s7b0JBQ0QsTUFBTSxXQUFXLEdBQUcseUNBQXlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDaEwsTUFBTSxZQUFZLEdBQUcseUNBQXlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDMU0sTUFBTSxhQUFhLEdBQUcsb0ZBQW9GLEtBQUssU0FBUyxRQUFRLDRCQUE0QixRQUFRLFFBQVEsUUFBUSxpQkFBaUIsQ0FBQztvQkFDdE0sTUFBTSxhQUFhLEdBQUcsR0FBRyxXQUFXLGlEQUFpRCxLQUFLLDhDQUE4QyxRQUFRLFNBQVMsUUFBUSxRQUFRLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQztvQkFDM0wsTUFBTSxjQUFjLEdBQUcsR0FBRyxZQUFZLG1EQUFtRCxLQUFLLGlDQUFpQyxRQUFRLFNBQVMsUUFBUSxRQUFRLFFBQVEsR0FBRyxDQUFDLG1CQUFtQixDQUFDO29CQUVoTSxNQUFNLE9BQU8sR0FBRzt3QkFDWiwrQkFBK0IsZUFBZSxhQUFhLGVBQWUsd0VBQXdFLGVBQWUsSUFBSSxlQUFlLElBQUk7d0JBQ3hMLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQzt3QkFDN0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUscUJBQXFCLEtBQUssRUFBRSxFQUFFLGdCQUFnQixDQUFDO3dCQUM3SCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNsTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNsTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNsTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNsTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNwTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNwTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUNwTCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFD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