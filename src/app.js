function KonOpas(set) {
	this.id = '';
	this.lc = 'en';
	this.tag_categories = false;
	this.default_duration = 60;
	this.time_show_am_pm = false;
	this.abbrev_00_minutes = true; // only for am/pm time
	this.always_show_participants = false;
	this.expand_all_max_items = 100;
	this.show_all_days_by_default = false;
	this.non_ascii_people = false; // setting true enables correct but slower sort
	this.use_server = false;
	this.log_messages = true;
	this.cache_refresh_interval_mins = 60;
	this.views = [ "star", "prog", "part", "info" ];
	if (typeof set == 'object') for (var i in set) this[i] = set[i];

	if (!this.log_messages) _log = function(){};
	if (i18n[this.lc]) {
		i18n.txt = function(key, data){ return key in i18n[this.lc] ? i18n[this.lc][key](data) : key; }.bind(this);
		i18n.translate_html(i18n[this.lc], 'data-txt');
	} else alert('Locale "' + this.lc + '" not found.');
	if (!this.id) alert(i18n.txt('no_ko_id'));
	if (!Array.prototype.indexOf || !Array.prototype.filter || !Array.prototype.map
		|| !Date.now || !('localStorage' in window)) alert(i18n.txt('old_browser'));

	this.prog = new Prog();
	this.stars = new Stars(this.id);
	this.server = this.use_server && window.Server && new Server(this.id, this.stars);
	Item();
	this.part = new Part(people, this);
	this.info = new Info();
	window.onhashchange = this.init_view.bind(this);
	var pl = document.getElementsByClassName('popup-link');
	for (var i = 0; i < pl.length; ++i) pl[i].addEventListener('click', popup_open);
	if (EL('refresh')) window.addEventListener('load', this.refresh_cache.bind(this), false);
}

KonOpas.prototype.storage_get = function(name) {
	var v = sessionStorage.getItem('konopas.' + this.id + '.' + name);
	return v ? JSON.parse(v) : v;
}

KonOpas.prototype.storage_set = function(name, value) {
	try {
		sessionStorage.setItem('konopas.' + this.id + '.' + name, JSON.stringify(value));
	} catch (e) {
		if ((e.code === DOMException.QUOTA_EXCEEDED_ERR) && (sessionStorage.length === 0)) {
			this.storage_set = function(){};
			alert(i18n.txt('private_mode'));
		} else throw e;
	}
}

KonOpas.prototype.init_view = function() {
	var opt = window.location.hash.substr(1);
	switch (opt.substr(0,4)) {
		case 'star': this.stars.show(opt.substr(4)); break;
		case 'part': this.part.show(opt.substr(4)); break;
		case 'info': this.info.show(); break;
		default:     this.prog.show(); break;
	}
	if (EL("load_disable")) EL("load_disable").style.display = "none";
}

KonOpas.prototype.set_view = function(new_view) {
	var cl = document.body.classList;
	for (var i = 0; i < this.views.length; ++i) {
		cl[new_view == this.views[i] ? 'add' : 'remove'](this.views[i]);
	}
}

KonOpas.prototype.refresh_cache = function() {
	var t_interval = this.cache_refresh_interval_mins * 60000,
	    cache = window.applicationCache;
	if (!t_interval || (t_interval < 0)) return;
	cache.addEventListener('updateready', function() {
		if (cache.status == cache.UPDATEREADY) {
			EL('refresh').classList.add('enabled');
			EL('refresh').onclick = function() { window.location.reload(); };
		}
	}, false);
	if (cache.status != cache.UNCACHED) {
		window.setInterval(function() { cache.update(); }, t_interval);
	}
}

var ko = new KonOpas(konopas_set);
var server = ko.server;
ko.init_view();
