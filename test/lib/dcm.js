// DCM extension for selenium wd.

module.exports = function (wd) {
  var url;

  // loads DCM application
  wd.PromiseChainWebdriver.prototype.dcm = function (options) {
    url = options.url;

    return this
      .get(url);
  };

  // logins to the DCM main application
  wd.PromiseChainWebdriver.prototype.dcmLogin = function (username, password) {
    return this
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
      .elementByCss('form[name=LoginForm] button[type=submit]').click();
  };

  // goes to the Party tab
  wd.PromiseChainWebdriver.prototype.dcmPartyTab = function() {
    return this
      .frame('navbar')
      .elementById('Party').click();
  };

  // selects Party main frame
  wd.PromiseChainWebdriver.prototype.dcmPersonPartyPage = function () {
    return this
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage');
  };

  // selects Party components frame
  wd.PromiseChainWebdriver.prototype.dcmPersonPartyComponentsPage = function () {
    return this
      .dcmPersonPartyPage()
      .frame('component_iframe');
  };

  // selects Party main frame
  wd.PromiseChainWebdriver.prototype.dcmNewPersonPartyPage = function () {
    return this
      .dcmPersonPartyPage()
      .elementById('Button_Person_Main_NewPerson').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('proppage');
  };

  // selects any button
  wd.PromiseChainWebdriver.prototype.dcmSelectButton = function (containerCss) {
    var selector = containerCss ? containerCss + ' .btn' : '.btn';
    return this
      .elementByCss(selector);
  };

  // selects disabled button
  wd.PromiseChainWebdriver.prototype.dcmSelectDisabledButton = function () {
    return this
      .elementByCss('.btn.pass');
  };

  // selects green button
  wd.PromiseChainWebdriver.prototype.dcmSelectGreenButton = function () {
    return this
      .elementByCss('.btn.btn-green:not(.pass)');
  };

  // selects grey button
  wd.PromiseChainWebdriver.prototype.dcmSelectGreyButton = function () {
    return this
      .elementByCss('.btn.btn-grey:not(.pass)');
  };

  // selects blue button
  wd.PromiseChainWebdriver.prototype.dcmSelectBlueButton = function () {
    return this
      .elementByCss('.btn.btn-blue:not(.pass)');
  };

  // selects red button
  wd.PromiseChainWebdriver.prototype.dcmSelectRedButton = function () {
    return this
      .elementByCss('.btn.btn-red:not(.pass)');
  };

  // selects table cell
  wd.PromiseChainWebdriver.prototype.dcmSelectTableCell = function () {
    return this
      .elementByCss('table.table td');
  };

  // selects table cell bold text
  wd.PromiseChainWebdriver.prototype.dcmSelectTableCellBold = function () {
    return this
      .elementByCss('table.table td strong');
  };

  return wd;
};