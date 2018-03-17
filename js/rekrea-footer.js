/* =========================================================
 * bootstrap-datepicker.js 
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
!function( $ ) {
	
	// Picker object
	
	var Datepicker = function(element, options){
		this.element = $(element);
		this.format = DPGlobal.parseFormat(options.format||this.element.data('date-format')||'mm/dd/yyyy');
		this.picker = $(DPGlobal.template)
							.appendTo('body')
							.on({
								click: $.proxy(this.click, this),
								mousedown: $.proxy(this.mousedown, this)
							});
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;
		
		if (this.isInput) {
			this.element.on({
				focus: $.proxy(this.show, this),
				blur: $.proxy(this.hide, this),
				keyup: $.proxy(this.update, this)
			});
		} else {
			if (this.component){
				this.component.on('click', $.proxy(this.show, this));
			} else {
				this.element.on('click', $.proxy(this.show, this));
			}
		}
		
		this.viewMode = 0;
		this.weekStart = options.weekStart||this.element.data('date-weekstart')||0;
		this.weekEnd = this.weekStart == 0 ? 6 : this.weekStart - 1;
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();
	};
	
	Datepicker.prototype = {
		constructor: Datepicker,
		
		show: function(e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (e ) {
				e.stopPropagation();
				e.preventDefault();
			}
			if (!this.isInput) {
				$(document).on('mousedown', $.proxy(this.hide, this));
			}
			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},
		
		hide: function(){
			this.picker.hide();
			$(window).off('resize', this.place);
			this.viewMode = 0;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown', this.hide);
			}
			this.setValue();
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},
		
		setValue: function() {
			var formated = DPGlobal.formatDate(this.date, this.format);
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').prop('value', formated);
				}
				this.element.data('date', formated);
			} else {
				this.element.prop('value', formated);
			}
		},
		
		place: function(){
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.css({
				top: offset.top + this.height,
				left: offset.left
			});
		},
		
		update: function(){
			this.date = DPGlobal.parseDate(
				this.isInput ? this.element.prop('value') : this.element.data('date'),
				this.format
			);
			this.viewDate = new Date(this.date);
			this.fill();
		},
		
		fillDow: function(){
			var dowCnt = this.weekStart;
			var html = '<tr>';
			while (dowCnt < this.weekStart + 7) {
				html += '<th class="dow">'+DPGlobal.dates.daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},
		
		fillMonths: function(){
			var html = '';
			var i = 0
			while (i < 12) {
				html += '<span class="month">'+DPGlobal.dates.monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').append(html);
		},
		
		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getFullYear(),
				month = d.getMonth(),
				currentDate = this.date.valueOf();
			this.picker.find('.datepicker-days th:eq(1)')
						.text(DPGlobal.dates.months[month]+' '+year);
			var prevMonth = new Date(year, month-1, 28,0,0,0,0),
				day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			prevMonth.setDate(day);
			prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42);
			nextMonth = nextMonth.valueOf();
			html = [];
			var clsName;
			while(prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getDay() == this.weekStart) {
					html.push('<tr>');
				}
				clsName = '';
				if (prevMonth.getMonth() < month) {
					clsName += ' old';
				} else if (prevMonth.getMonth() > month) {
					clsName += ' new';
				}
				if (prevMonth.valueOf() == currentDate) {
					clsName += ' active';
				}
				html.push('<td class="day'+clsName+'">'+prevMonth.getDate() + '</td>');
				if (prevMonth.getDay() == this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
			var currentYear = this.date.getFullYear();
			
			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear == year) {
				months.eq(this.date.getMonth()).addClass('active');
			}
			
			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year'+(i == -1 || i == 10 ? ' old' : '')+(currentYear == year ? ' active' : '')+'">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},
		
		click: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var target = $(e.target).closest('span, td, th');
			if (target.length == 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								this.viewDate['set'+DPGlobal.modes[this.viewMode].navFnc].call(
									this.viewDate,
									this.viewDate['get'+DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) + 
									DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1)
								);
								this.fill();
								break;
						}
						break;
					case 'span':
						if (target.is('.month')) {
							var month = target.parent().find('span').index(target);
							this.viewDate.setMonth(month);
						} else {
							var year = parseInt(target.text(), 10)||0;
							this.viewDate.setFullYear(year);
						}
						this.showMode(-1);
						this.fill();
						break;
					case 'td':
						if (target.is('.day')){
							var day = parseInt(target.text(), 10)||1;
							var month = this.viewDate.getMonth();
							if (target.is('.old')) {
								month -= 1;
							} else if (target.is('.new')) {
								month += 1;
							}
							var year = this.viewDate.getFullYear();
							this.date = new Date(year, month, day,0,0,0,0);
							this.viewDate = new Date(year, month, day,0,0,0,0);
							this.fill();
							this.setValue();
							this.element.trigger({
								type: 'changeDate',
								date: this.date
							});
						}
						break;
				}
			}
		},
		
		mousedown: function(e){
			e.stopPropagation();
			e.preventDefault();
		},
		
		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(0, Math.min(2, this.viewMode + dir));
			}
			this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
		}
	};
	
	$.fn.datepicker = function ( option ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults,options))));
			}
			if (typeof option == 'string') data[option]();
		});
	};

	$.fn.datepicker.defaults = {
	};
	$.fn.datepicker.Constructor = Datepicker;
	
	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		dates:{
			days: ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"],
			daysShort: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
			daysMin: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
			months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
			monthsShort: ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.", "12."]
		},
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		parseFormat: function(format){
			var separator = format.match(/[.\/-].*?/),
				parts = format.split(/\W+/);
			if (!separator || !parts || parts.length == 0){
				throw new Error("Chybný formát data.");
			}
			return {separator: separator, parts: parts};
		},
		parseDate: function(date, format) {
			var parts = date.split(format.separator),
				date = new Date(1970, 1, 1, 0, 0, 0),
				val;
			if (parts.length == format.parts.length) {
				for (var i=0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10)||1;
					switch(format.parts[i]) {
						case 'dd':
						case 'd':
							date.setDate(val);
							break;
						case 'mm':
						case 'm':
							date.setMonth(val - 1);
							break;
						case 'yy':
							date.setFullYear(2000 + val);
							break;
						case 'yyyy':
							date.setFullYear(val);
							break;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format){
			var val = {
				d: date.getDate(),
				m: date.getMonth() + 1,
				yy: date.getFullYear().toString().substring(2),
				yyyy: date.getFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [];
			for (var i=0, cnt = format.parts.length; i < cnt; i++) {
				date.push(val[format.parts[i]]);
			}
			return date.join(format.separator);
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev"><i class="icon-arrow-left"/></th>'+
								'<th colspan="5" class="switch"></th>'+
								'<th class="next"><i class="icon-arrow-right"/></th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
	};
	DPGlobal.template = '<div class="datepicker dropdown-menu">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
								'</table>'+
							'</div>'+
						'</div>';

}( window.jQuery )
/**
* pine-navigation.js v0.5.0
*/
!function(a){a.log=function(a){window.log&&window.console&&window.console.log&&console.log(a)}}(window.jQuery||window.Zepto),window.matchMq=window.matchMedia||function(a){var b=a.documentElement,c=b.firstElementChild||b.firstChild,d=a.createElement("body"),e=a.createElement("div");e.id="mq-test-1",e.style.cssText="position:absolute;top:-100em",d.style.background="none",d.appendChild(e);var f,g=function(a){return e.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',b.insertBefore(d,c),bool=42===e.offsetWidth,b.removeChild(d),{matches:bool,media:a}},h=function(){var c,d=b.body,g=!1;return e.style.cssText="position:absolute;font-size:1em;width:1em",d||(d=g=a.createElement("body"),d.style.background="none"),d.appendChild(e),b.insertBefore(d,b.firstChild),g?b.removeChild(d):d.removeChild(e),c=f=parseFloat(e.offsetWidth)},i=g("(min-width: 0px)").matches;return function(b){if(i)return g(b);var c=b.match(/\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),d=b.match(/\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),e=null===c,j=null===d,k=a.body.offsetWidth,l="em";return c&&(c=parseFloat(c)*(c.indexOf(l)>-1?f||h():1)),d&&(d=parseFloat(d)*(d.indexOf(l)>-1?f||h():1)),bool=(!e||!j)&&(e||k>=c)&&(j||d>=k),{matches:bool,media:b}}}(document);var Pine=window.Pine||{};Pine.Submenu=function(a){"use strict";var b={};return b.toggle=function(b){var c=a(b.currentTarget).closest(".pine-has-subnav"),d=this.activeTransition&&this.activeTransition.beforeToggle,e=b.data&&b.data.isActive||c.hasClass("pine-level-open");b.preventDefault(),d&&"function"==typeof d&&d.call(b.currentTarget,e),e?(c.trigger(b=a.Event("hide")),c.removeClass("pine-level-open").trigger("hidden"),a.log("Event: hide")):(c.trigger(b=a.Event("show")),c.addClass("pine-level-open").trigger("shown"),a.log("Event: show"))},b}(window.jQuery,window);var Pine=window.Pine||{};Pine.Navbar=function(a,b){"use strict";var c={};return c.isLargeDisplay=null,c.element=null,c.DEFAULTS={largeDisplayStart:"600px",fxSmallDisplay:"fx-right-to-left",fxLargeDisplay:"fx-hover-fade"},c.NAVBAR_TOGGLE="[data-pine=toggle]",c.SUBMENU=".pine-has-subnav",c.options=null,c.transitions={},c.activeTransition={},c.init=function(c,d){this.options=a.extend({},this.DEFAULTS,d),this.element=a(c),this.isLargeDisplay=b.matchMq("(min-width: "+this.options.largeDisplayStart+")").matches,this.setActiveTransition(this.isLargeDisplay?this.options.fxLargeDisplay:this.options.fxSmallDisplay),this.element.find("li").has("ul").addClass("pine-has-subnav"),this.element.find("a").on("focus",this.focus),a(document).on("click.pine",this.SUBMENU+" > a",a.proxy(Pine.Submenu.toggle,Pine.Navbar)),a(this.NAVBAR_TOGGLE).on("click.pine",Pine.Navbar.toggle),a(this.SUBMENU).removeClass("pine-level-open"),a(b).on({load:a.proxy(this.api,this),resize:a.proxy(this.api,this)})},c.api=function(a){var b=this.checkMedia(a);return null===b?!1:(this.activeTransition&&"function"==typeof this.activeTransition.onSwitch&&this.activeTransition.onSwitch.call(this,!1),this.switchView(b),void(this.activeTransition&&"function"==typeof this.activeTransition.onSwitch&&this.activeTransition.onSwitch.call(this,!0)))},c.checkMedia=function(a){var c=b.matchMq("(min-width: "+this.options.largeDisplayStart+")").matches,d=a.type&&"load"==a.type;return!d&&(!this.isLargeDisplay&&!c||this.isLargeDisplay&&c)?null:this.isLargeDisplay=c},c.switchView=function(b){var c=this.getTransitionName(b),d=this.getTransitionName(!b);this.element.removeClass(d).addClass(c),this.setActiveTransition(c),a.log("Transition: "+c),this.resetNav()},c.focus=function(){var b=a(this),c=b.parent();c.hasClass("pine-has-subnav")&&!c.hasClass("pine-level-open")&&b.trigger(a.Event("mouseover"));var d=a(".pine-level-open");0!=d.length&&d.filter(function(){return 0===a(this).find(b).length}).removeClass("pine-level-open")},c.toggle=function(c){c.preventDefault();var d=a(document).find(a(this).attr("href")),e=a(b).height();a(this).toggleClass("is-active"),d.toggleClass("pine-visible"),d.hasClass("pine-visible")?(d.css({"max-height":e}),a("body").css({overflow:"hidden"})):(d.css({"max-height":0}),a("body").removeAttr("style")),a.log("Event: Toggle Navbar")},c.resetNav=function(){a(this.SUBMENU).removeClass("pine-level-open")},c.setActiveTransition=function(a){this.activeTransition=this.transitions[a]||!1},c.getTransitionName=function(a){return a?this.options.fxLargeDisplay:this.options.fxSmallDisplay},c.registerTransition=function(a,b){this.transitions[a]=b},c.beforeTransition=function(a,b){var c=this.activeTransition&&this.activeTransition.beforeToggle;c&&"function"==typeof c&&c.call(a,b)},c}(window.jQuery,window);var pine_fx_hover={onSwitch:function(a){a?$(document).on("mouseenter.pine",this.SUBMENU,{isActive:!1},$.proxy(Pine.Submenu.toggle,this)).on("mouseleave.pine",this.SUBMENU,{isActive:!0},$.proxy(Pine.Submenu.toggle,this)).off("click.pine"):$(document).off("mouseenter.pine").off("mouseleave.pine").on("click.pine",this.SUBMENU+" > a",$.proxy(Pine.Submenu.toggle,this))},beforeToggle:function(){}};Pine.Navbar.registerTransition("fx-hover",pine_fx_hover),Pine.Navbar.registerTransition("fx-hover-fade",$.extend({},pine_fx_hover)),Pine.Navbar.registerTransition("fx-right-to-left",{onSwitch:function(a){var b=this.element,c=b.find("li").has("ul"),d=function(){$(".fx-right-to-left ul").css("width",$(window).width())};a?(c.each(function(){$(this).find("ul").first().prepend($('<li class="pine-back"><a href="#">'+$(this).find("a").first().text()+"</a></li>"))}),$(document).on("click.pine",".pine-back",$.proxy(Pine.Submenu.toggle,this)),b.find("ul").css("width",$(window).width()),$(window).on({resize:d,orientationchange:d}),$.log("ENTER small view")):(b.find("ul").removeAttr("style"),c.find("li.pine-back").remove(),$(window).off("resize",d),$.log("LEAVE small view"))},beforeToggle:function(a){var b=$(this),c=b.parents("ul"),d=a?c.length-2:c.length;c.last().animate({left:-100*d+"%"},300)}}),window.jQuery&&function(a,b){"use strict";var c=a.fn.pine;a.fn.pine=function(c){return this.each(function(){var d=a(this),e=d.data("pine"),f=a.extend({},d.data(),"object"==typeof c&&c);e||d.data("pine",e=b.Navbar.init(this,f))})},a.fn.pine.Module=b.Navbar,a.fn.pine.noConflict=function(){return a.fn.pine=c,this}}(window.jQuery,Pine),function(a){"use strict";a("[data-pine=navbar]").pine()}(window.Zepto||window.jQuery);
/*
 * FancyBox - jQuery Plugin
 * Simple and fancy lightbox alternative
 *
 * Examples and documentation at: http://fancybox.net
 * 
 * Copyright (c) 2008 - 2010 Janis Skarnelis
 *
 * Version: 1.3.1 (05/03/2010)
 * Requires: jQuery v1.3+
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function(b){var m,u,x,g,D,i,z,A,B,p=0,e={},q=[],n=0,c={},j=[],E=null,s=new Image,G=/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,S=/[^\.]\.(swf)\s*$/i,H,I=1,k,l,h=false,y=b.extend(b("<div/>")[0],{prop:0}),v=0,O=!b.support.opacity&&!window.XMLHttpRequest,J=function(){u.hide();s.onerror=s.onload=null;E&&E.abort();m.empty()},P=function(){b.fancybox('<p id="fancybox_error">The requested content cannot be loaded.<br />Please try again later.</p>',{scrolling:"no",padding:20,transitionIn:"none",transitionOut:"none"})},
K=function(){return[b(window).width(),b(window).height(),b(document).scrollLeft(),b(document).scrollTop()]},T=function(){var a=K(),d={},f=c.margin,o=c.autoScale,t=(20+f)*2,w=(20+f)*2,r=c.padding*2;if(c.width.toString().indexOf("%")>-1){d.width=a[0]*parseFloat(c.width)/100-40;o=false}else d.width=c.width+r;if(c.height.toString().indexOf("%")>-1){d.height=a[1]*parseFloat(c.height)/100-40;o=false}else d.height=c.height+r;if(o&&(d.width>a[0]-t||d.height>a[1]-w))if(e.type=="image"||e.type=="swf"){t+=r;
w+=r;o=Math.min(Math.min(a[0]-t,c.width)/c.width,Math.min(a[1]-w,c.height)/c.height);d.width=Math.round(o*(d.width-r))+r;d.height=Math.round(o*(d.height-r))+r}else{d.width=Math.min(d.width,a[0]-t);d.height=Math.min(d.height,a[1]-w)}d.top=a[3]+(a[1]-(d.height+40))*0.5;d.left=a[2]+(a[0]-(d.width+40))*0.5;if(c.autoScale===false){d.top=Math.max(a[3]+f,d.top);d.left=Math.max(a[2]+f,d.left)}return d},U=function(a){if(a&&a.length)switch(c.titlePosition){case "inside":return a;case "over":return'<span id="fancybox-title-over">'+
a+"</span>";default:return'<span id="fancybox-title-wrap"><span id="fancybox-title-left"></span><span id="fancybox-title-main">'+a+'</span><span id="fancybox-title-right"></span></span>'}return false},V=function(){var a=c.title,d=l.width-c.padding*2,f="fancybox-title-"+c.titlePosition;b("#fancybox-title").remove();v=0;if(c.titleShow!==false){a=b.isFunction(c.titleFormat)?c.titleFormat(a,j,n,c):U(a);if(!(!a||a==="")){b('<div id="fancybox-title" class="'+f+'" />').css({width:d,paddingLeft:c.padding,
paddingRight:c.padding}).html(a).appendTo("body");switch(c.titlePosition){case "inside":v=b("#fancybox-title").outerHeight(true)-c.padding;l.height+=v;break;case "over":b("#fancybox-title").css("bottom",c.padding);break;default:b("#fancybox-title").css("bottom",b("#fancybox-title").outerHeight(true)*-1);break}b("#fancybox-title").appendTo(D).hide()}}},W=function(){b(document).unbind("keydown.fb").bind("keydown.fb",function(a){if(a.keyCode==27&&c.enableEscapeButton){a.preventDefault();b.fancybox.close()}else if(a.keyCode==
37){a.preventDefault();b.fancybox.prev()}else if(a.keyCode==39){a.preventDefault();b.fancybox.next()}});if(b.fn.mousewheel){g.unbind("mousewheel.fb");j.length>1&&g.bind("mousewheel.fb",function(a,d){a.preventDefault();h||d===0||(d>0?b.fancybox.prev():b.fancybox.next())})}if(c.showNavArrows){if(c.cyclic&&j.length>1||n!==0)A.show();if(c.cyclic&&j.length>1||n!=j.length-1)B.show()}},X=function(){var a,d;if(j.length-1>n){a=j[n+1].href;if(typeof a!=="undefined"&&a.match(G)){d=new Image;d.src=a}}if(n>0){a=
j[n-1].href;if(typeof a!=="undefined"&&a.match(G)){d=new Image;d.src=a}}},L=function(){i.css("overflow",c.scrolling=="auto"?c.type=="image"||c.type=="iframe"||c.type=="swf"?"hidden":"auto":c.scrolling=="yes"?"auto":"visible");if(!b.support.opacity){i.get(0).style.removeAttribute("filter");g.get(0).style.removeAttribute("filter")}b("#fancybox-title").show();c.hideOnContentClick&&i.one("click",b.fancybox.close);c.hideOnOverlayClick&&x.one("click",b.fancybox.close);c.showCloseButton&&z.show();W();b(window).bind("resize.fb",
b.fancybox.center);c.centerOnScroll?b(window).bind("scroll.fb",b.fancybox.center):b(window).unbind("scroll.fb");b.isFunction(c.onComplete)&&c.onComplete(j,n,c);h=false;X()},M=function(a){var d=Math.round(k.width+(l.width-k.width)*a),f=Math.round(k.height+(l.height-k.height)*a),o=Math.round(k.top+(l.top-k.top)*a),t=Math.round(k.left+(l.left-k.left)*a);g.css({width:d+"px",height:f+"px",top:o+"px",left:t+"px"});d=Math.max(d-c.padding*2,0);f=Math.max(f-(c.padding*2+v*a),0);i.css({width:d+"px",height:f+
"px"});if(typeof l.opacity!=="undefined")g.css("opacity",a<0.5?0.5:a)},Y=function(a){var d=a.offset();d.top+=parseFloat(a.css("paddingTop"))||0;d.left+=parseFloat(a.css("paddingLeft"))||0;d.top+=parseFloat(a.css("border-top-width"))||0;d.left+=parseFloat(a.css("border-left-width"))||0;d.width=a.width();d.height=a.height();return d},Q=function(){var a=e.orig?b(e.orig):false,d={};if(a&&a.length){a=Y(a);d={width:a.width+c.padding*2,height:a.height+c.padding*2,top:a.top-c.padding-20,left:a.left-c.padding-
20}}else{a=K();d={width:1,height:1,top:a[3]+a[1]*0.5,left:a[2]+a[0]*0.5}}return d},N=function(){u.hide();if(g.is(":visible")&&b.isFunction(c.onCleanup))if(c.onCleanup(j,n,c)===false){b.event.trigger("fancybox-cancel");h=false;return}j=q;n=p;c=e;i.get(0).scrollTop=0;i.get(0).scrollLeft=0;if(c.overlayShow){O&&b("select:not(#fancybox-tmp select)").filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one("fancybox-cleanup",function(){this.style.visibility="inherit"});
x.css({"background-color":c.overlayColor,opacity:c.overlayOpacity}).unbind().show()}l=T();V();if(g.is(":visible")){b(z.add(A).add(B)).hide();var a=g.position(),d;k={top:a.top,left:a.left,width:g.width(),height:g.height()};d=k.width==l.width&&k.height==l.height;i.fadeOut(c.changeFade,function(){var f=function(){i.html(m.contents()).fadeIn(c.changeFade,L)};b.event.trigger("fancybox-change");i.empty().css("overflow","hidden");if(d){i.css({top:c.padding,left:c.padding,width:Math.max(l.width-c.padding*
2,1),height:Math.max(l.height-c.padding*2-v,1)});f()}else{i.css({top:c.padding,left:c.padding,width:Math.max(k.width-c.padding*2,1),height:Math.max(k.height-c.padding*2,1)});y.prop=0;b(y).animate({prop:1},{duration:c.changeSpeed,easing:c.easingChange,step:M,complete:f})}})}else{g.css("opacity",1);if(c.transitionIn=="elastic"){k=Q();i.css({top:c.padding,left:c.padding,width:Math.max(k.width-c.padding*2,1),height:Math.max(k.height-c.padding*2,1)}).html(m.contents());g.css(k).show();if(c.opacity)l.opacity=
0;y.prop=0;b(y).animate({prop:1},{duration:c.speedIn,easing:c.easingIn,step:M,complete:L})}else{i.css({top:c.padding,left:c.padding,width:Math.max(l.width-c.padding*2,1),height:Math.max(l.height-c.padding*2-v,1)}).html(m.contents());g.css(l).fadeIn(c.transitionIn=="none"?0:c.speedIn,L)}}},F=function(){m.width(e.width);m.height(e.height);if(e.width=="auto")e.width=m.width();if(e.height=="auto")e.height=m.height();N()},Z=function(){h=true;e.width=s.width;e.height=s.height;b("<img />").attr({id:"fancybox-img",
src:s.src,alt:e.title}).appendTo(m);N()},C=function(){J();var a=q[p],d,f,o,t,w;e=b.extend({},b.fn.fancybox.defaults,typeof b(a).data("fancybox")=="undefined"?e:b(a).data("fancybox"));o=a.title||b(a).title||e.title||"";if(a.nodeName&&!e.orig)e.orig=b(a).children("img:first").length?b(a).children("img:first"):b(a);if(o===""&&e.orig)o=e.orig.attr("alt");d=a.nodeName&&/^(?:javascript|#)/i.test(a.href)?e.href||null:e.href||a.href||null;if(e.type){f=e.type;if(!d)d=e.content}else if(e.content)f="html";else if(d)if(d.match(G))f=
"image";else if(d.match(S))f="swf";else if(b(a).hasClass("iframe"))f="iframe";else if(d.match(/#/)){a=d.substr(d.indexOf("#"));f=b(a).length>0?"inline":"ajax"}else f="ajax";else f="inline";e.type=f;e.href=d;e.title=o;if(e.autoDimensions&&e.type!=="iframe"&&e.type!=="swf"){e.width="auto";e.height="auto"}if(e.modal){e.overlayShow=true;e.hideOnOverlayClick=false;e.hideOnContentClick=false;e.enableEscapeButton=false;e.showCloseButton=false}if(b.isFunction(e.onStart))if(e.onStart(q,p,e)===false){h=false;
return}m.css("padding",20+e.padding+e.margin);b(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change",function(){b(this).replaceWith(i.children())});switch(f){case "html":m.html(e.content);F();break;case "inline":b('<div class="fancybox-inline-tmp" />').hide().insertBefore(b(a)).bind("fancybox-cleanup",function(){b(this).replaceWith(i.children())}).bind("fancybox-cancel",function(){b(this).replaceWith(m.children())});b(a).appendTo(m);F();break;case "image":h=false;b.fancybox.showActivity();
s=new Image;s.onerror=function(){P()};s.onload=function(){s.onerror=null;s.onload=null;Z()};s.src=d;break;case "swf":t='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+e.width+'" height="'+e.height+'"><param name="movie" value="'+d+'"></param>';w="";b.each(e.swf,function(r,R){t+='<param name="'+r+'" value="'+R+'"></param>';w+=" "+r+'="'+R+'"'});t+='<embed src="'+d+'" type="application/x-shockwave-flash" width="'+e.width+'" height="'+e.height+'"'+w+"></embed></object>";m.html(t);
F();break;case "ajax":a=d.split("#",2);f=e.ajax.data||{};if(a.length>1){d=a[0];if(typeof f=="string")f+="&selector="+a[1];else f.selector=a[1]}h=false;b.fancybox.showActivity();E=b.ajax(b.extend(e.ajax,{url:d,data:f,error:P,success:function(r){if(E.status==200){m.html(r);F()}}}));break;case "iframe":b('<iframe id="fancybox-frame" name="fancybox-frame'+(new Date).getTime()+'" frameborder="0" hspace="0" scrolling="'+e.scrolling+'" src="'+e.href+'"></iframe>').appendTo(m);N();break}},$=function(){if(u.is(":visible")){b("div",
u).css("top",I*-40+"px");I=(I+1)%12}else clearInterval(H)},aa=function(){if(!b("#fancybox-wrap").length){b("body").append(m=b('<div id="fancybox-tmp"></div>'),u=b('<div id="fancybox-loading"><div></div></div>'),x=b('<div id="fancybox-overlay"></div>'),g=b('<div id="fancybox-wrap"></div>'));if(!b.support.opacity){g.addClass("fancybox-ie");u.addClass("fancybox-ie")}D=b('<div id="fancybox-outer"></div>').append('<div class="fancy-bg" id="fancy-bg-n"></div><div class="fancy-bg" id="fancy-bg-ne"></div><div class="fancy-bg" id="fancy-bg-e"></div><div class="fancy-bg" id="fancy-bg-se"></div><div class="fancy-bg" id="fancy-bg-s"></div><div class="fancy-bg" id="fancy-bg-sw"></div><div class="fancy-bg" id="fancy-bg-w"></div><div class="fancy-bg" id="fancy-bg-nw"></div>').appendTo(g);
D.append(i=b('<div id="fancybox-inner"></div>'),z=b('<a id="fancybox-close"></a>'),A=b('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),B=b('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));z.click(b.fancybox.close);u.click(b.fancybox.cancel);A.click(function(a){a.preventDefault();b.fancybox.prev()});B.click(function(a){a.preventDefault();b.fancybox.next()});if(O){x.get(0).style.setExpression("height",
"document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + 'px'");u.get(0).style.setExpression("top","(-20 + (document.documentElement.clientHeight ? document.documentElement.clientHeight/2 : document.body.clientHeight/2 ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop )) + 'px'");D.prepend('<iframe id="fancybox-hide-sel-frame" src="javascript:\'\';" scrolling="no" frameborder="0" ></iframe>')}}};
b.fn.fancybox=function(a){b(this).data("fancybox",b.extend({},a,b.metadata?b(this).metadata():{})).unbind("click.fb").bind("click.fb",function(d){d.preventDefault();if(!h){h=true;b(this).blur();q=[];p=0;d=b(this).attr("rel")||"";if(!d||d==""||d==="nofollow")q.push(this);else{q=b("a[rel="+d+"], area[rel="+d+"]");p=q.index(this)}C();return false}});return this};b.fancybox=function(a,d){if(!h){h=true;d=typeof d!=="undefined"?d:{};q=[];p=d.index||0;if(b.isArray(a)){for(var f=0,o=a.length;f<o;f++)if(typeof a[f]==
"object")b(a[f]).data("fancybox",b.extend({},d,a[f]));else a[f]=b({}).data("fancybox",b.extend({content:a[f]},d));q=jQuery.merge(q,a)}else{if(typeof a=="object")b(a).data("fancybox",b.extend({},d,a));else a=b({}).data("fancybox",b.extend({content:a},d));q.push(a)}if(p>q.length||p<0)p=0;C()}};b.fancybox.showActivity=function(){clearInterval(H);u.show();H=setInterval($,66)};b.fancybox.hideActivity=function(){u.hide()};b.fancybox.next=function(){return b.fancybox.pos(n+1)};b.fancybox.prev=function(){return b.fancybox.pos(n-
1)};b.fancybox.pos=function(a){if(!h){a=parseInt(a,10);if(a>-1&&j.length>a){p=a;C()}if(c.cyclic&&j.length>1&&a<0){p=j.length-1;C()}if(c.cyclic&&j.length>1&&a>=j.length){p=0;C()}}};b.fancybox.cancel=function(){if(!h){h=true;b.event.trigger("fancybox-cancel");J();e&&b.isFunction(e.onCancel)&&e.onCancel(q,p,e);h=false}};b.fancybox.close=function(){function a(){x.fadeOut("fast");g.hide();b.event.trigger("fancybox-cleanup");i.empty();b.isFunction(c.onClosed)&&c.onClosed(j,n,c);j=e=[];n=p=0;c=e={};h=false}
if(!(h||g.is(":hidden"))){h=true;if(c&&b.isFunction(c.onCleanup))if(c.onCleanup(j,n,c)===false){h=false;return}J();b(z.add(A).add(B)).hide();b("#fancybox-title").remove();g.add(i).add(x).unbind();b(window).unbind("resize.fb scroll.fb");b(document).unbind("keydown.fb");i.css("overflow","hidden");if(c.transitionOut=="elastic"){k=Q();var d=g.position();l={top:d.top,left:d.left,width:g.width(),height:g.height()};if(c.opacity)l.opacity=1;y.prop=1;b(y).animate({prop:0},{duration:c.speedOut,easing:c.easingOut,
step:M,complete:a})}else g.fadeOut(c.transitionOut=="none"?0:c.speedOut,a)}};b.fancybox.resize=function(){var a,d;if(!(h||g.is(":hidden"))){h=true;a=i.wrapInner("<div style='overflow:auto'></div>").children();d=a.height();g.css({height:d+c.padding*2+v});i.css({height:d});a.replaceWith(a.children());b.fancybox.center()}};b.fancybox.center=function(){h=true;var a=K(),d=c.margin,f={};f.top=a[3]+(a[1]-(g.height()-v+40))*0.5;f.left=a[2]+(a[0]-(g.width()+40))*0.5;f.top=Math.max(a[3]+d,f.top);f.left=Math.max(a[2]+
d,f.left);g.css(f);h=false};b.fn.fancybox.defaults={padding:10,margin:20,opacity:false,modal:false,cyclic:false,scrolling:"auto",width:560,height:340,autoScale:true,autoDimensions:true,centerOnScroll:false,ajax:{},swf:{wmode:"transparent"},hideOnOverlayClick:true,hideOnContentClick:false,overlayShow:true,overlayOpacity:0.3,overlayColor:"#666",titleShow:true,titlePosition:"outside",titleFormat:null,transitionIn:"fade",transitionOut:"fade",speedIn:300,speedOut:300,changeSpeed:300,changeFade:"fast",
easingIn:"swing",easingOut:"swing",showCloseButton:true,showNavArrows:true,enableEscapeButton:true,onStart:null,onCancel:null,onComplete:null,onCleanup:null,onClosed:null};b(document).ready(function(){aa()})})(jQuery);
/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($) {

  $.fn.unveil = function(threshold, callback) {

    var $w = $(window),
        th = threshold || 0,
        retina = window.devicePixelRatio > 1,
        attrib = retina? "data-src-retina" : "data-src",
        images = this,
        loaded;

    this.one("unveil", function() {
      var source = this.getAttribute(attrib);
      source = source || this.getAttribute("data-src");
      if (source) {
        this.setAttribute("src", source);
        if (typeof callback === "function") callback.call(this);
      }
    });

    function unveil() {
      var inview = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }

    $w.scroll(unveil);
    $w.resize(unveil);

    unveil();

    return this;

  };

})(window.jQuery || window.Zepto);

/* =============================================================
 * bootstrap-collapse.js v2.0.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function( $ ){

  "use strict"

  var Collapse = function ( element, options ) {
  	this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options["parent"]) {
      this.$parent = $(this.options["parent"])
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension = this.dimension()
        , scroll = $.camelCase(['scroll', dimension].join('-'))
        , actives = this.$parent && this.$parent.find('.in')
        , hasData

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', 'show', 'shown')
      this.$element[dimension](this.$element[0][scroll])

    }

  , hide: function () {
      var dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', 'hide', 'hidden')
      this.$element[dimension](0)
    }

  , reset: function ( size ) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element.addClass('collapse')
    }

  , transition: function ( method, startEvent, completeEvent ) {
      var that = this
        , complete = function () {
            if (startEvent == 'show') that.reset()
            that.$element.trigger(completeEvent)
          }

      this.$element
        .trigger(startEvent)
        [method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
  	}

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
  	}

  }

  /* COLLAPSIBLE PLUGIN DEFINITION
  * ============================== */

  $.fn.collapse = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSIBLE DATA-API
  * ==================== */

  $(function () {
    $('body').on('click.collapse.data-api', '[data-toggle=collapse]', function ( e ) {
      var $this = $(this), href
        , target = $this.attr('data-target')
          || e.preventDefault()
          || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
        , option = $(target).data('collapse') ? 'toggle' : $this.data()
      $(target).collapse(option)
    })
  })

}( window.jQuery );
/*
  Centrani javascript pro DCK Rekrea Ostrava
  a pridruzene weby
  ..................................................................................
  1) Udalosti
    a) Po nacteni dokumentu
    b) Po nacteni DOM i obrazku
    c) Po zmene velikosti okna
  2) Funkce
  ..................................................................................
  Autor: Martin Michalek, webmaster@eslovensko.cz
*/



/* ================================================================================
   1) Udalosti
*/


/* --------------------------------------------------------------------------------
   a) Po nacteni dokumentu
*/

$(document).ready(function() {

  // Nastaveni globalnich promennych do objektu
  window.rekrea_config = {
    version : 'desktop',
    version_switch_window_width : 768
  }

  // Pine.JS inicializace
  $('.pine').pine({
      largeDisplayStart: '768px'
    });

  // Podle velikosti displeje nastavujeme verzi
  set_config_version();

	// Fancybox: Osetreni otevirani detailu fotek
	$(".fancybox").fancybox({
    'overlayOpacity': .8,
    'overlayColor': '#000',
    'padding': '0'
	});

	// Fancybox: Osetreni otevirani #content_body casti cizich stranek
  $(".fancybox_content").click(function(e){
      e.preventDefault();
      $.ajax({
         url: $(this).attr('href'),
         cache: false,
         async: false,
         dataType: "html",
         success: function(data){
            html = $(data).find("#content");
             $.fancybox({
               'overlayOpacity': .8,
               'overlayColor': '#000',
               'padding': '0',
               'scrolling': 'no',
               'content': html
            });
         }
      });
      return false;
  });

	// Fancybox: Osetreni otevirani info okynek do iframu na desktopu
	// Napr. atrakce na seznamu atrakci na malych webech
	$(".fancybox_iframe").click(function() {
	  if (rekrea_config.version == 'desktop') {
  		$.fancybox(ajaxize_url($(this).find('.text. strong a').attr('href')),{
  		    'overlayOpacity': .8,
  		    'overlayColor': '#000',
  		    'padding': 0,
  		    'type': 'iframe',
  		    'width': 1000,
  		    'height': 575
  			});
      return false;
    }
	});

  // Fancygallery
  // Nyni jen otevirani Flickru do noveho okna.
  // Puvodne: Prohlizec fotek stahovanych primo z Flickru postaveny na Fancyboxu.
  $('.fancygallery').click(function() {
    window.open($(this).attr('href'));
    return false;
  });

  // Handler pro nove last minute
  if (!!$('.lmItem').length)
    handleLastMinute ()

  // Univerzalni informativni hlaska
  if (!!$('.message').length)
    handle_message_fadeout()

  // Osetrime zoomovani na orientacni mapce v atrakcich atd.
  if (!!$('.landmark_map .zoom_2').length)
    handle_landmark_map()

  // Hovery na stylovenem seznamu .images_list
  if (!!$('.images_list li').length)
    handle_images_list()

  // Placeholder do "patickoveho" formulare pro prihlaseni k newsletteru
  if (!!$('#footNewsletter').length)
    add_placeholder()

  // Osetrime akce v seznamu ubytovani
  if (!!$('.list_item').length)
    handle_list_item()

  // Osetrime rozklikavani .details/.summary
  if (!!$('.details .summary').length)
    handle_details_summary()

  // Detail kapacity: trackovani rezervacniho procesu pro Google Analytics
  if (!!$('#otevrit_rezervaci').length)
    handle_reservation_ga_tracking()

	// Nacitame iOS slider - napr. titulky HL.cz a HJ.cz
	if (!!$('.iosSlider').length)
		handle_ios_slider();

  // Smoothscrolling na kotvach uvnitr stranek
  if (!!$('#container a[href*=#]:not([href=#])').length)
    handle_smooth_scroll();

  // Otevirani a zavirani fulltextu na malych displejich
  if ( (!!$('.site-search').length) && (rekrea_config.version == 'mobile') )
    handle_small_screen_nav();

  $(".unveil").unveil(100, function() {
      $(this).load(function() {
          this.style.opacity = 1;
      });
  });

});


/* --------------------------------------------------------------------------------
   b) Po nacteni DOM i obrazku
*/
$(window).load(function() {


});



/* --------------------------------------------------------------------------------
   c) Po zmene velikosti okna
*/

$(window).resize(function() {

  // Podle velikosti displeje nastavujeme verzi
  set_config_version();

});




/* ================================================================================
   2) Funkce
*/

// Handler pro nove last minute
function handleLastMinute () {

  $('.lmItem').click(function() {
    window.location = $(this).find('a:first').attr('href').toString();
    return false;
  });

  $('.lmItem .hotels a').click(function(event) {
    event.stopPropagation();
  });

}


// Fadeout univerzalni info hlasky
function handle_message_fadeout() {
	if ($('.message:visible').hasClass('lasting_message')) {
  	setTimeout(blind_up, 10000,'.message');
	} else {
  	setTimeout(blind_up, 5000,'.message');
	}
}

function blind_up(element) {
  $(element).animate({
    top: '-400px'
  }, 600 )
  $(element).remove()
}

/*
   Simulujeme HTML5 atribut placeholder u inputu ve vsech prohlizecich,
   protoze Chrome10 ma neprijemnou chybu s pozicovanim.
   Vyuzivame ve novem "patickovem" formulari pro prihlaseni k newsletteru.
   Az se Chrome vzpamatuje, budeme simulovat jen v prohlecich bez podpory placeholderu:
   if (!Modernizr.input.placeholder) { }
*/
function add_placeholder() {
  $('#footNewsletter').find("input[placeholder]").each(function(){
      var $this = $(this);
      var placeholder = $this.attr('placeholder');
      if ($this.val() == "" && placeholder != "") {
          $this.val(placeholder);
      }
      $this.focus(function(){
          if ($this.val() == placeholder) $this.val("");
      });
      $this.blur(function(){
          if ($this.val() == "") $this.val(placeholder);
      });
  });
}


/*
   Detekujeme mobil/desktop verzi podle sirky obrazovky
*/
function set_config_version() {
  if ($(window).width() < rekrea_config.version_switch_window_width) {
    rekrea_config.version = 'mobile';
  } else {
    rekrea_config.version = 'desktop';
  }
}

/*
   Prevede bezne URL na ajaxovou verzi
   http://www.e-slovensko.cz/atrakce/1148-thermal-park-besenova/
   -->
   http://www.e-slovensko.cz/ajax/atrakce/1148-thermal-park-besenova/
*/
function ajaxize_url(url) {
  return url.replace('.cz/','.cz/ajax/').replace('.local/','.local/ajax/');
}


/*
  Osetrime zoomovani na orientacni mapce v atrakcich atd.
*/
function handle_landmark_map() {
  var $landmark_maps = $('.landmark_map .maps');
  $landmark_maps.hover(function() {
     $landmark_maps.find('.zoom_1').fadeOut('slow', function() {
       setTimeout("$('.landmark_map .maps').find('.zoom_2').fadeOut('slow')", 1000);
     });
  }, function() {
    $landmark_maps.find('.zoom_2, .zoom_1').fadeIn();
  });
}

/*
  Kliky na stylovenem seznamu .images_list
  Oteviraji odkazovane url, krome situace kdy je chceme otevirat z iframove verze
  do Fancyboxu na desktopu. Tam navesujeme klikaci udalost uz na <li> - viz vyse.
*/
function handle_images_list() {
	if (rekrea_config.version == 'desktop') {
    $('.images_list li:not(.fancybox_iframe)').click(function() {
      window.location = $(this).find('a:first').attr('href');
    });
  } else {
    $('.images_list li').click(function() {
      window.location = $(this).find('a:first').attr('href');
    });
  }
  return false;
}


/*
  Osetrime akce v seznamu ubytovani
*/
function handle_list_item() {
  $('.list_item').click(function() {
    window.location = $(this).find('h2 a').attr('href').toString();
    return false;
  });
  // Kliknutim na obec nebo na ikonu LM/FM nechceme skocit na detail ubytovani
  $('.list_item .place a, .list_item .icon').click(function(event) {
    event.stopPropagation();
  });
}

/*
  Osetrime rozklikavani .details/.summary
*/
function handle_details_summary() {
  $('.details .details_content').hide();
  $('.details .summary').click(function() {
		$(this).closest('.details').toggleClass('open');
		$(this).siblings('.details_content').toggle(200);
  });
}

/*
  Detail kapacity: trackovani rezervacniho procesu pro Google Analytics
*/
function handle_reservation_ga_tracking() {
	$('#otevrit_rezervaci').click(function() {
		try {
	    var myTracker=_gat._getTrackerByName();
			_gaq.push(['_trackPageview', '/ubytovani/rezervace/']);
      ga('send', 'pageview', '/ubytovani/rezervace/'); // Universal Analytics
		 } catch(err) {}
	});
	$('#rezerv_submit').click(function() {
		try {
	    var myTracker=_gat._getTrackerByName();
			_gaq.push(['_trackPageview', '/ubytovani/rezervace/dekujeme/']);
      ga('send', 'pageview', '/ubytovani/rezervace/dekujeme/'); // Universal Analytics
		 } catch(err) {}
	});
}

/*
  iOS Slider na uvodnich strankach
  Napr. HL.cz nebo HJ.cz
	Vyuziva http://iosscripts.com/iosslider/
*/
function handle_ios_slider() {

 	$('.iosSlider').iosSlider({
 		// desktopClickDrag: true, <-- bug?
 		snapToChildren: true,
 		infiniteSlider: true,
 		navSlideSelector: '.slideSelectors .item',
 		onSlideChange: slideChange,
 		autoSlide: true,
 		scrollbar: true,
 		scrollbarContainer: '.scrollbarContainer',
 		scrollbarMargin: '0',
 		scrollbarBorderRadius: '0',
 		keyboardControls: true
 	});

 function slideChange(args) {
 	$('.slideSelectors .item').removeClass('selected');
 	$('.slideSelectors .item:eq(' + (args.currentSlideNumber - 1) + ')').addClass('selected');
 }

}

/*
  Smoothscrolling na kotvy uvnitr stranek
  Napr. odkaz na #ceny v detailu kapacity 2014 reprezentovany tlacitkem.
  Zdroj: http://css-tricks.com/snippets/jquery/smooth-scrolling/
  TODO:
  - na konci do url pridat hash, aby se dal posilat v adrese
  - return false nebo preventDefault() ale musi byt, aby to nejdriv neskocilo dolu
    a pak zase nahoru a pozvolna animovalo dolu :)
*/

function handle_smooth_scroll() {
  $('#container a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
}

/*
  Osetreni klikani na navigaci na malych displejich
*/
function handle_small_screen_nav() {

  // Klikani na ikonu vyhledavani
  $('.site-nav__small-screen-search').click(function(event) {
    // Schovame navigaci
    $('.pine').removeClass('pine-visible');
    $('.site-nav__small-screen-nav').removeClass('active');
    // Zobrazime vyhledavani
    $('.site-search').toggle();
    $(this).toggleClass('active');
    return false;
  });

  // Klikani na ikonu navigace
  // (Zbytek resi Pine.js)
  $('.site-nav__small-screen-nav').click(function(event) {
    $('.site-nav__small-screen-search').removeClass('active');
  });

}

