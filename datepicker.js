(function (angular) {

    'use strict';

    var controllerDependencies = [
        "$scope",
        "$timeout",
        "$filter",
        controller
    ];

    function controller(scope, $timeout, $filter) {
        var default_range = (scope.yearRange == undefined || isNaN(scope.yearRange)
                             || scope.yearRange == "" || Number(scope.yearRange) < 0) ? 10
            : scope.yearRange;

        scope.default_min_date =
            (scope.minDate == undefined) ? new Date(new Date().setFullYear(
                (new Date().getFullYear()) - Number(default_range))) : scope.minDate;
        scope.default_max_date =
            (scope.maxDate == undefined) ? new Date(new Date().setFullYear(
                (new Date().getFullYear()) + Number(default_range))) : scope.maxDate;
        scope.offset_max       =
            scope.offset_min =
                (-10 <= Number(scope.offset) && Number(scope.offset) <= 10) ? Number(scope.offset)
                    : 1;

        scope.gracefull_reset = false;
        var date_map          = {};
        var format_map        = {};
        var default_format    = "dd/MM/yyyy";

        scope.id_ = "div_" + new Date().getTime().toString();
        var id_   = scope.id_;

        scope.first_box          =
        {
            format      : "",
            numbers_only: false,
            length      : 2,
            validated   : undefined,
            id          : "one" + scope.id_,
            value       : undefined
        };
        scope.second_box         =
        {
            format      : "",
            numbers_only: false,
            length      : 2,
            validated   : undefined,
            id          : "two" + scope.id_,
            value       : undefined
        };
        scope.third_box          =
        {
            format      : "",
            numbers_only: false,
            length      : 2,
            validated   : undefined,
            id          : "three" + scope.id_,
            value       : undefined
        };
        scope.date_parsed        = false;
        scope.max_date_for_month = 31;

        scope.full_month = ["January", "February", "March", "April", "May", "June", "July",
                            "August", "September", "October", "November", "December"];

        scope.short_month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        scope.error_queue    = [];
        var unexistent_month = "Month cannot be validated";
        var unexistent_date  = "Date is out of range";
        var unexistent_year  = "Year is out of range";
        scope.below_min_date =
            "Cannot set date before " + $filter('date')(scope.default_min_date, default_format);
        scope.above_max_date =
            "Cannot set date after " + $filter('date')(scope.default_max_date, default_format);

        if (scope.ngModel == undefined) {
            var d = new Date();
            d.setHours(0, 0, 0);
            scope.ngModel = d;

            scope.ngSet = false;
        } else {
            scope.ngSet = true;
        }

        scope.init_map = function () {
            date_map['y'] = ["yy", "yyyy"];
            date_map['M'] = ["MM", "MMM", "MMMM"];
            date_map['d'] = ["dd"];
        };

        scope.init_format_map = function () {
            format_map["yyyy"] = function (box) {
                box.type         = 'y';
                box.length       = 4;
                box.numbers_only = true;
            };
            format_map["yy"]   = function (box) {
                box.type         = 'y';
                box.length       = 2;
                box.numbers_only = true;
            };
            format_map["dd"]   = function (box) {
                box.type         = 'd';
                box.length       = 2;
                box.numbers_only = true;
            };
            format_map["MM"]   = function (box) {
                box.type         = 'm';
                box.length       = 2;
                box.numbers_only = true;
            };
            format_map["MMM"]  = function (box) {
                box.type         = 'm';
                box.length       = 3;
                box.numbers_only = false;
            };
            format_map["MMMM"] = function (box) {
                box.type         = 'm';
                box.length       = 9;
                box.numbers_only = false;
            };
        };

        // paese a given date format
        scope.format_confirmed = function (string) {
            var format_ = scope.failed_parse;
            if (date_map[string[0]]) {
                date_map[string[0]].forEach(function (format) {
                    if (format == string.slice(0, format.length)) {
                        format_ = format;
                    }
                });
                delete date_map[string[0]];
            }
            return format_;
        };

        scope.parse_format = function (format) {
            var length_covered = 0;
            scope.init_map();
            scope.first_box.format = scope.format_confirmed(format);
            if (scope.first_box.format) {
                scope.splitter1         =
                    format.slice(length_covered + scope.first_box.format.length,
                                 length_covered + scope.first_box.format.length + 1);
                length_covered += scope.first_box.format.length + 1;
                scope.second_box.format =
                    scope.format_confirmed(format.slice(length_covered, format.length));
                if (scope.second_box.format) {
                    scope.splitter2        =
                        format.slice(length_covered + scope.second_box.format.length,
                                     length_covered + scope.second_box.format.length + 1);
                    length_covered += scope.second_box.format.length + 1;
                    scope.third_box.format =
                        scope.format_confirmed(format.slice(length_covered, format.length));
                }
            }
            return !!(scope.first_box.format && scope.second_box.format && scope.third_box.format
                      && scope.splitter1 && scope.splitter2);
        };

        scope.set_boxes = function (format) {
            if (format == "longDate") {
                scope.parse_format("MMMM dd,yy");
            }
            else if (format == "mediumDate") {
                scope.parse_format("MMM dd,yy");
            }
            else if (format == "shortDate") {
                scope.parse_format("MM/dd/yy");
            }
            else {
                if (!scope.parse_format(scope.format)) {
                    scope.parse_format(default_format);
                }
            }

            scope.init_format_map();

            format_map[scope.third_box.format](scope.third_box);
            format_map[scope.second_box.format](scope.second_box);
            format_map[scope.first_box.format](scope.first_box);
        };

        scope.set_boxes(scope.format);

        var isMonth = function (format) {
            return format[0] == 'M';
        };

        var isYear = function (format) {
            return format[0] == 'y';
        };

        var isDate = function (format) {
            return format[0] == 'd';
        };

        //*********************KEY*PRESS*START*********************//

        scope.down1 = function (event) {
            if (event.keyCode == 39 && event.target.selectionStart == scope.first_box.length) {
                document.getElementById("two" + id_).focus();
            }
        };

        scope.up1 = function (event) {
            if (event.target.selectionStart == scope.first_box.length) {
                document.getElementById("two" + id_).focus();
            }
        };

        scope.up2 = function (event) {
            // if((event.keyCode == 8 || event.keyCode == 37) && event.target.selectionStart == 0)
            // 	document.forms[id_].one.focus();

            if (event.target.selectionStart == scope.second_box.length) {
                document.getElementById("three" + id_).focus();
            }
        };

        scope.down2 = function (event) {
            if ((event.keyCode == 8 || event.keyCode == 37) && event.target.selectionStart == 0) {
                document.getElementById("one" + id_).focus();
            }

            if (event.keyCode == 39 && event.target.selectionStart == scope.second_box.length) {
                document.getElementById("three" + id_).focus();
            }

        };

        scope.down3 = function (event) {
            if ((event.keyCode == 8 || event.keyCode == 37) && event.target.selectionStart == 0) {
                document.getElementById("two" + id_).focus();
            }
        };

        scope.press3 = function (event) {
            if (scope.third_box.numbers_only) {
                if (isNaN(String.fromCharCode(event.keyCode))) {
                    event.preventDefault();
                }
            }
        };

        scope.press2 = function (event) {
            if (scope.second_box.numbers_only) {
                if (isNaN(String.fromCharCode(event.keyCode))) {
                    event.preventDefault();
                }
            }
        };

        scope.press1 = function (event) {
            if (scope.first_box.numbers_only) {
                if (isNaN(String.fromCharCode(event.keyCode))) {
                    event.preventDefault();
                }
            }
        };
        //*********************KEY*PRESS*END*********************//

        //*********************PARSE*AND*VALIDATE***************//

        scope.determine_parse = function (box, date) {
            if (box.type == 'm') {
                if (box.format == "MMM") {
                    return scope.short_month[date.getMonth()];
                } else if (box.format == "MMMM") {
                    box.length = scope.full_month[date.getMonth()].length;
                    return scope.full_month[date.getMonth()];
                }
                else if (box.format == "MM") {
                    return (((date.getMonth() + 1) + "").length == 1) ? "0" + (date.getMonth() + 1)
                        : date.getMonth() + 1;
                }
            } else if (box.type == 'y') {
                if (box.format == "yyyy") {
                    return date.getFullYear();
                } else if (box.format == "yy") {
                    return date.getFullYear().toString().substring(2);
                }
            } else if (box.type == 'd') {
                return (0 < date.getDate() && date.getDate() <= 9) ? "0" + date.getDate()
                    : date.getDate();
            }
        };

        scope.set_validity = function () {
            scope.first_box.validated  = true;
            scope.second_box.validated = true;
            scope.third_box.validated  = true;
        };

        scope.parseDate = function (date) {
            scope.first_box.value  = scope.determine_parse(scope.first_box, date);
            scope.second_box.value = scope.determine_parse(scope.second_box, date);
            scope.third_box.value  = scope.determine_parse(scope.third_box, date);
            scope.date_parsed      = true;
        };

        //build module to determine how many days in a specific month
        scope.days_in_month = function () {
            // there are 3 formats of the month supported: MM MMM MMMM
            var m;
            if (scope.my_format == "MM") {
                m = scope.my_month;
            } else if (scope.my_format == "MMM") {
                m = scope.short_month.indexOf(scope.my_month) + 1;
            } else if (scope.my_format == "MMMM") {
                m = scope.full_month.indexOf(scope.my_month) + 1;
            }

            scope.max_date_for_month = new Date(scope.my_year, m, 0).getDate();
        };

        scope.validete = function (box) {
            //offset is not 100% handled... from looks of it

            if (box.value.length == undefined) {
                box.validated = true;
            }

            if (box.format == "MM") {

                if (0 < Number(box.value) && Number(box.value) <= 12 && (box.value + "").length
                                                                        == 2) {

                    delete scope.error_queue['month'];
                    box.validated = true;
                }
                else {

                    scope.error_queue['month'] = unexistent_month;
                    box.validated              = false;

                }
            } else if (box.format == "MMM") {
                if (contains(scope.short_month, box.value)) {
                    delete scope.error_queue['month'];
                    box.validated = true;
                }
                else {
                    scope.error_queue['month'] = unexistent_month;
                    box.validated              = false;

                }
            } else if (box.format == "MMMM") {

                if (contains(scope.full_month, box.value)) {
                    delete scope.error_queue['month'];
                    box.validated = true;
                }
                else {
                    scope.error_queue['month'] = unexistent_month;
                    box.validated              = false;

                }
            }

            if (box.format == "dd") {
                if (1 <= box.value && box.value <= scope.max_date_for_month && (box.value
                                                                                + "").length == 2) {
                    delete scope.error_queue['date'];
                    box.validated = true;
                }
                else {
                    scope.error_queue['date'] = unexistent_date;
                    box.validated             = false;
                }

            }

            if (box.format == "yyyy" && scope.default_max_date instanceof Date
                && scope.default_min_date instanceof Date) {
                if ((box.value + "").length == 4) {
                    box.validated = true;
                    delete scope.error_queue['year'];
                }
                else {
                    box.validated             = false;
                    scope.error_queue['year'] = unexistent_year;
                }
            }
            else if (box.format == 'yy') {

                var condition = (scope.default_min_date.getYear() % 100
                                 < scope.default_max_date.getYear() % 100) ?
                                scope.default_min_date.getYear() % 100 <= box.value && box.value
                                                                                       <= scope.default_max_date.getYear()
                                                                                          % 100
                    :
                                (scope.default_min_date.getYear() % 100 <= box.value || box.value
                                                                                        <= scope.default_max_date.getYear()
                                                                                           % 100);
                if (condition && box.value != undefined && (box.value + "").length == 2) {
                    delete scope.error_queue['year'];
                    box.validated = true;
                }
                else {
                    scope.error_queue['year'] = unexistent_year;
                    box.validated             = false;

                }
            }
        };

        scope.set_date_param = function (box, date) {

            if (box.format == "MMMM") {
                date.setMonth(scope.full_month.indexOf(box.value));
            } else if (box.format == "MMM") {
                date.setMonth(scope.short_month.indexOf(box.value));
            } else if (box.format == "MM") {
                date.setMonth(Number(box.value)-1);
            } else if (box.format == "yy") {
                if (box.value >= scope.default_min_date.getYear() % 100) {
                    date.setFullYear(
                        Math.floor(scope.default_min_date.getFullYear() / 100) * 100 + Number(
                            box.value));
                } else {
                    date.setFullYear(
                        Math.floor(scope.default_max_date.getFullYear() / 100) * 100 + Number(
                            box.value));
                }
            }

            else if (box.format == "yyyy") {
                date.setFullYear(box.value);
            } else if (box.format == "dd") {
                date.setDate(box.value);
            }
            return date;
        };

        scope.calculate_offset = function () {
            scope.default_min_offset_date = angular.copy(scope.default_min_date);
            scope.default_max_offset_date = angular.copy(scope.default_max_date);

            scope.default_min_offset_date.setDate(
                scope.default_min_date.getDate() + scope.offset_min);
            scope.default_min_offset_date.setHours(0, 0, 0, 0);

            scope.default_max_offset_date.setDate(
                scope.default_max_date.getDate() - scope.offset_max);
            scope.default_min_offset_date.setHours(0, 0, 0, 0);

            if (scope.default_min_offset_date.getTime() > scope.default_max_offset_date.getTime()) {
                scope.default_min_offset_date = scope.default_min_date;
                scope.default_max_offset_date = scope.default_max_date;
                console.log("Offset failed: offset dates cannot overlap");
            }
        };

        scope.date_validation = function (date, extra) {
            var valid = true;

            scope.calculate_offset();

            if ((scope.default_min_offset_date.getFullYear() == date.getFullYear()
                 && scope.default_min_offset_date.getMonth() > date.getMonth()) ||
                (scope.default_min_offset_date.getFullYear() == date.getFullYear()
                 && scope.default_min_offset_date.getMonth() == date.getMonth()
                 && scope.default_min_offset_date.getDate() > date.getDate())
                || scope.default_min_offset_date.getFullYear() > date.getFullYear()

            ) {
                console.log("hi1");

                if (extra == undefined) {
                    scope.error_message = scope.below_min_date;
                }
                valid = false;

                scope.gracefull_reset     = true;
                scope.mindateAlertMessage = true;
                scope.ngModel             = scope.default_min_offset_date;
                $timeout(function () {
                    scope.mindateAlertMessage = false;
                }, 3000);
                scope.ngModel.setHours(0, 0, 0, 0);
                scope.local_ngModel = scope.ngModel;
                scope.parseDate(scope.local_ngModel);

                //scope.default_month = scope.full_month[scope.local_ngModel.getMonth()];
                scope._month = scope.ngModel.getMonth();
                scope._year  = scope.local_ngModel.getFullYear();
                scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                scope.local_ngModel.getFullYear()));

            } else if ((scope.default_max_offset_date.getFullYear() == date.getFullYear()
                        && scope.default_max_offset_date.getMonth() < date.getMonth()) ||
                       (scope.default_max_offset_date.getFullYear() == date.getFullYear()
                        && scope.default_max_offset_date.getMonth() == date.getMonth()
                        && scope.default_max_offset_date.getDate() < date.getDate()
                       || scope.default_max_offset_date.getFullYear() < date.getFullYear()
                       )
            ) {
                console.log("hi5");

                scope.gracefull_reset = true;
                if (extra == undefined) {
                    scope.error_message = scope.above_max_date;
                }
                scope.ngModel       = scope.default_max_offset_date;
                scope.local_ngModel = scope.default_max_offset_date;

                scope.ngModel.setHours(0, 0, 0, 0);
                scope.local_ngModel = scope.ngModel;
                scope.parseDate(scope.local_ngModel);

                scope.local_ngModel = date;
                scope.default_month = scope.full_month[scope.local_ngModel.getMonth()];
                scope._month        = scope.ngModel.getMonth();
                scope._year         = scope.local_ngModel.getFullYear();
                scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                scope.local_ngModel.getFullYear()));

                scope.maxdateAlertMessage = true;
                $timeout(function () {
                    scope.maxdateAlertMessage = false;
                }, 3000);

                valid = false;
            }


            return (extra && valid) || !!(scope.local_ngModel.getTime() != date.getTime() && valid);
        };

        scope.final_validation = function () {

            //console.log("here");

            var date = new Date();
            console.log(scope.first_box);
            // console.log(scope.second_box);
            // console.log(scope.third_box);

            date     = scope.set_date_param(scope.third_box, date);
            date     = scope.set_date_param(scope.second_box, date);
            date     = scope.set_date_param(scope.first_box, date);



            date     = scope.toUTC(date);

            date.setHours(0, 0, 0, 0);


            //console.log(date);

            //
             //console.log(scope.ngSet);

            //  scope.local_ngModel = date;

             console.log(scope.date_validation(date));

             if (scope.date_validation(date)) {


                scope.default_month = scope.full_month[scope.local_ngModel.getMonth()];
                scope._year         = scope.local_ngModel.getFullYear();
                scope._month        = scope.ngModel.getMonth();
                scope.local_ngModel = date;
                console.log("changed");
                scope.ngModel       = date;
                scope.build(scope.days_in_month(scope.local_ngModel.getMonth()-1,
                                                scope.local_ngModel.getFullYear()));

            }

        };

        scope.get_error = function () {
            scope.error_message =
                scope.error_queue[Object.keys(scope.error_queue)[scope.error_queue.length]];
        };

        //*****************************************************//

        scope.begin_date_determination = function (box) {
            // problem in here
            if (isMonth(box.format)) {
                scope.my_month  = box.value;
                scope.my_format = box.format;
                scope.days_in_month();
            } else if (isYear(box.format)) {
                scope.my_year = box.value;
                scope.days_in_month();
            }

            if (scope.my_date_box) {
                scope.validete(scope.my_date_box);
            }

            scope.max_date_for_month =
                isNaN(scope.max_date_for_month) ? 31 : scope.max_date_for_month;
        };

        scope.picker_blur = function (event, box) {
            var el = $("#" + event.target.id);
            if (box.format == "MMMM" && box.validated == true) {
                el.animate({width: (box.value.length == 0) ? 102 : box.value.length * 12});
                box.length = box.value.length;
            }
        };

        scope.picker_focus = function (event, box) {
            var el = $("#" + event.target.id);
            if (box.format == "MMMM") {

                el.animate({width: 102, transition: 0});

                box.length = box.value ? box.value.length : 9;
            }
        };

        scope.picker_change = function (box) {
            var el = $("#" + box.id);

            if (box.format == "MMMM" && box.validated == true) {
                el.animate({width: 22});
                box.length = box.value ? box.value.length : 9;
            }
        };

        scope.reset_year_format = function (box) {
            if (box.format == "yy") {
                var x = new Date();
                x.setFullYear(scope.local_ngModel.getFullYear());
                var min_full = scope.default_min_date.getFullYear();
                var max_full = scope.default_max_date.getFullYear();

                if ((max_full - min_full >= 100) || (min_full > x.getFullYear() || x.getFullYear()
                                                                                   > max_full )) {
                    box.format = "yyyy";
                    box.length = 4;
                    box.value  = scope.local_ngModel.getFullYear();
                    console.log("Cannot use short year for time period: "
                                + scope.default_min_date.getFullYear() + " - "
                                + scope.default_max_date.getFullYear() +
                                " with date like " + $filter('date')(new Date(), "MM/dd/yyyy"));
                }
            }
        };

        scope.bool1           = true;
        scope.bool2           = true;
        scope.bool3           = true;
        scope.gracefull_reset = true;

        scope.first_box.foo = function (new_, old_) {
            if (new_ != undefined) {

                if (scope.gracefull_reset) {
                    $timeout(function () {
                        scope.bool1 = true;
                    }, 200);
                    scope.bool1 = false;
                    //scope.gracefull_reset = false
                }

                scope.reset_year_format(scope.first_box);
                scope.validete(scope.first_box);

                if (isDate(scope.first_box.format)) {
                    scope.my_date_box = scope.first_box;
                    scope.my_date     = new_;
                    scope.begin_date_determination(scope.first_box);
                } else if (scope.first_box.validated) {
                    scope.begin_date_determination(scope.first_box);
                }

                if (isYear(scope.first_box.format)) {
                    scope.my_year_box = scope.first_box;
                }

                if (scope.first_box.format == "MMMM" && scope.first_box.validated == true && new_
                                                                                             != old_) {
                    document.forms[id_].two.focus();
                } else if (scope.first_box.format == "MMMM" && scope.first_box.validated == false) {
                    scope.first_box.length = 9;
                }
                scope.get_error();

                if (scope.error_queue.length == 0 &&
                    scope.first_box.validated == true && scope.second_box.validated == true
                    && scope.third_box.validated == true) {
                    scope.final_validation();
                }
            }
        };

        scope.second_box.foo = function (new_, old_) {
            if (new_) {

                if (scope.gracefull_reset) {
                    $timeout(function () {
                        scope.bool2 = true;
                    }, 200);
                    scope.bool2 = false;
                    //scope.gracefull_reset = false;
                }

                scope.reset_year_format(scope.second_box);
                scope.validete(scope.second_box);

                if (isDate(scope.second_box.format)) {
                    scope.my_date_box = scope.second_box;
                    scope.my_date     = new_;
                    scope.begin_date_determination(scope.first_box);
                } else if (scope.second_box.validated) {
                    scope.begin_date_determination(scope.second_box);
                }

                if (isYear(scope.second_box.format)) {
                    scope.my_year_box = scope.second_box;
                }

                if (scope.second_box.format == "MMMM" && scope.second_box.validated == true && new_
                                                                                               != old_) {
                    document.forms[id_].three.focus();
                } else if (scope.second_box.format == "MMMM" && scope.second_box.validated == false) {
                    scope.second_box.length = 9;
                }

                scope.get_error();

                if (scope.error_queue == 0 &&
                    scope.first_box.validated == true && scope.second_box.validated == true
                    && scope.third_box.validated == true) {
                    scope.final_validation();
                }
            }
        };

        scope.third_box.foo = function (new_, old_) {

            if (new_) {
                if (scope.gracefull_reset) {
                    $timeout(function () {
                        scope.bool3 = true;
                    }, 200);
                    scope.bool3           = false;
                    scope.gracefull_reset = false;
                }

                scope.reset_year_format(scope.third_box);
                //console.log(scope.third_box)

                scope.validete(scope.third_box);
                //console.log(scope.third_box)

                if (isDate(scope.third_box.format)) {
                    scope.my_date_box = scope.third_box;
                    scope.my_date     = new_;
                    scope.begin_date_determination(scope.first_box);
                } else if (scope.third_box.validated) {
                    scope.begin_date_determination(scope.third_box);

                }

                if (isYear(scope.third_box.format)) {
                    scope.my_year_box = scope.third_box;
                }

                scope.get_error();

                if (scope.error_queue.length == 0 &&
                    scope.first_box.validated == true && scope.second_box.validated == true
                    && scope.third_box.validated == true) {
                    scope.final_validation();
                }
            }

        };

        scope.$watch("first_box.value", scope.first_box.foo);
        scope.$watch("second_box.value", scope.second_box.foo);
        scope.$watch("third_box.value", scope.third_box.foo);

        scope.$watch('minDate', function (new_, old_) {
            if (new_ && old_) {

                if (new_ instanceof Date) {
                    scope.default_min_date = new_;
                    scope.calculate_offset();
                }

                scope.date_validation(scope.ngModel);
                if (scope.my_year_box) {
                    scope.my_year_box.foo(scope.my_year_box.value, scope.my_year_box.value);
                }

                scope.year_list = scope.generate_years();
                scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                scope.local_ngModel.getFullYear()));
            }
        });

        scope.$watch('maxDate', function (new_, old_) {

            if (new_ && old_) {

                // some cases new may come as something weird?..
                if (new_ instanceof Date) {
                    scope.default_max_date = new_;
                    scope.calculate_offset();
                }

                scope.date_validation(scope.ngModel);
                if (scope.my_year_box) {
                    scope.my_year_box.foo(scope.my_year_box.value, scope.my_year_box.value);
                }

                scope.year_list = scope.generate_years();
                scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                scope.local_ngModel.getFullYear()));
            }

        });

        scope.refresh = function () {
            scope.date_input = $filter('date')(new Date(), "MM/dd/yyyy");
            scope.year_list  = scope.generate_years();
            scope.build(scope.days_in_month(scope.local_ngModel.getMonth(),
                                            scope.local_ngModel.getFullYear()));
        };

        // helpfull
        function contains(array, obj) {
            var i = array.length;
            while (i--) {
                if (array[i] == obj) {
                    return true;
                }
            }
            return false;
        }

        //*******************************CALENDAR**TABLE*****************************/

        scope.set_boundaries = function () {


            // flags to check if min and max dates were set, and if correctly
            scope.is_min_set = (!(!(scope.default_min_date instanceof Date)
                                  || scope.default_min_date == undefined));
            scope.is_max_set = (!(!(scope.default_max_date instanceof Date)
                                  || scope.default_min_date == undefined));

            scope.selected_start_date = {};
            //set this year and month

            scope._year  = new Date().getFullYear();
            scope._month = new Date().getMonth() + 1;

            //check max first
            // if limit is greater/less than current month - render the max/min month
            if ((scope.is_min_set && !scope.is_max_set ) ||
                (scope.is_max_set && !scope.is_min_set) ||
                (scope.is_min_set && scope.is_max_set &&
                 scope.default_min_date < scope.default_max_date)) {
                if (scope.is_max_set) {
                    if (scope.default_max_date.getFullYear() < scope._year) {
                        scope._year  = scope.default_max_date.getFullYear();
                        scope._month = 1 + scope.default_max_date.getMonth();
                    }
                    else if (scope.default_max_date.getMonth() <= scope._month) {
                        scope._month = 1 + scope.default_max_date.getMonth();
                    }
                }
                if (scope.is_min_set) {
                    if (scope.default_min_date.getFullYear() > scope._year) {
                        scope._year  = scope.default_min_date.getFullYear();
                        scope._month = 1 + scope.default_min_date.getMonth();
                    }
                    else if (scope.default_min_date.getMonth() >= scope._month) {
                        scope._month = 1 + scope.default_min_date.getMonth();
                    }
                }
            }

        };
        scope.set_boundaries();

        scope.invalid_ = false;
        scope.table    = [];
        scope.row_size = 7;

        //statuses
        scope.status = {
            restricted_previous: 0,
            restricted_after   : 1,
            selected           : 2,
            deselected         : 3,
            limited_by_min     : 4,
            limited_by_max     : 5
        };

        scope.restrictedMessage = false;
        scope.action            = function (row, column, value) {
            scope.row    = row;
            scope.column = column;

            if (value.status == scope.status.restricted_previous) {
                scope.previous();
            } else if (value.status == scope.status.restricted_after) {
                scope.next();
            } else if (value.status == scope.status.limited_by_min) {
                scope.error_message_ = "This date is restricted";

                scope.restrictedMessage = true;
                $timeout(function () {
                    scope.restrictedMessage = false;
                }, 2500);
                // scope.invalid_ = true;
                // scope.valid_ = "bye-bye";
            }
            else if (value.status == scope.status.limited_by_max) {
                scope.error_message_    = "This date is restricted";
                scope.restrictedMessage = true;
                $timeout(function () {
                    scope.restrictedMessage = false;
                }, 2500);
                // scope.invalid_ = true;
                // scope.valid_ = "bye-bye";
            }
            else {
                if (scope.selected_start_date.location
                    && scope.table[scope.selected_start_date.location.row][scope.selected_start_date.location.column].status
                       == scope.status.selected) {
                    scope.table[scope.selected_start_date.location.row][scope.selected_start_date.location.column].status
                        = scope.status.deselected;
                }

                angular.forEach(scope.table, function (value, key) {

                    var currently_selected = $filter('filter')(value, {status: 2}, true)[0];

                    if (currently_selected) {
                        currently_selected.status = 3;
                    }

                });

                value.status                       = scope.status.selected;
                scope.selected_start_date.day      = value.value;
                scope.selected_start_date.month    = scope._month;
                scope.selected_start_date.year     = scope._year;
                scope.selected_start_date.location = {row: row, column: column};

                scope.picker = new Date();
                scope.picker.setFullYear(scope.selected_start_date.year,
                                         scope.selected_start_date.month,
                                         scope.selected_start_date.day);

                // added

                //scope.picker = $filter('date')(scope.picker, "MM/dd/yyyy");

                scope.ngModel         = scope.picker;
                scope.gracefull_reset = true;
                scope.ngModel.setHours(0, 0, 0, 0);
                scope.local_ngModel = scope.ngModel;
                scope.parseDate(scope.local_ngModel);

                scope.invalid_ = false;
                //scope.validate(scope.picker);

            }

            if (scope.daterange_on) {
                var start_date = scope.picker;
                scope.picker   = {
                    start_date: start_date
                };
            }
        };

        // rework an array to an arr of objects
        scope.convert_arr_of_obj = function (row, row_number) {
            var new_row = [];

            for (var j = 0; j < row.length; j++) {

                //configure status
                var status_;

                if (row[j] > scope.row_size && row_number == 0) {
                    status_ = scope.status.restricted_previous;
                } else if (row[j] < scope.row_size && row_number > 3) {
                    status_ = scope.status.restricted_after;
                } else if ((scope.is_min_set && !scope.is_max_set ) ||
                           (scope.is_max_set && !scope.is_min_set) ||
                           (scope.is_min_set && scope.is_max_set &&
                            scope.default_min_date < scope.default_max_date)) {

                    scope.calculate_offset();
                    if (scope.is_min_set &&
                        (scope._year == scope.default_min_offset_date.getFullYear() &&
                         scope._month < scope.default_min_offset_date.getMonth() ||
                         scope._year == scope.default_min_offset_date.getFullYear() &&
                         scope._month == scope.default_min_offset_date.getMonth() &&
                         row[j] < scope.default_min_offset_date.getDate() ||
                         scope._year < scope.default_min_offset_date.getFullYear()        )) {
                        status_ = scope.status.limited_by_min;
                    }
                    // ...xxx...
                    // afternote: weird, <= and >

                    else if (scope.is_max_set &&
                             (scope._year == scope.default_max_offset_date.getFullYear() &&
                              scope._month > scope.default_max_offset_date.getMonth() ||
                              scope._year == scope.default_max_offset_date.getFullYear() &&
                              scope._month == scope.default_max_offset_date.getMonth() &&
                              row[j] > scope.default_max_offset_date.getDate() ||
                              scope._year > scope.default_max_offset_date.getFullYear() )) {
                        status_ = scope.status.limited_by_max;
                    }
                    if (scope.local_ngModel.getMonth() == scope._month &&
                        scope.local_ngModel.getDate() == row[j] &&
                        scope.local_ngModel.getFullYear() == scope._year &&
                        (status_ != scope.status.limited_by_min || status_
                                                                   != scope.status.limited_by_max )) {
                        status_ = scope.status.selected;
                    }

                }
                else {
                    status_ = scope.status.deselected;
                }

                new_row.push({"value": row[j], "status": status_});
                status_ = undefined;
            }
            return new_row;
        };

        // refresh the table for the next month
        scope.next = function () {

            if (scope._month + 1 == 12) {
                scope._year++;
                scope.sm = [];
                scope.sm = scope.year_list.filter(function (value) {
                    return value === scope._year;
                });
                if (scope.sm.length < 1) {
                    scope.year_list.push(scope._year);
                }
            }

            scope._month = ((scope._month + 1) % 12);

            scope.date = scope.days_in_month(scope._month + 1, scope._year);
            scope.build(scope.date);
            //scope.default_month = scope.full_month[scope._month-1];

        };

        // refresh the table for the previous month
        scope.previous = function () {
            if (scope._month == 0) {
                scope._year--;
                scope.sm = [];
                scope.sm = scope.year_list.filter(function (value) {
                    return value === scope._year;
                });
                if (scope.sm.length < 1) {
                    scope.year_list.unshift(scope._year);
                }
            }

            if (scope._month != 0) {
                scope._month--;
            } else {
                scope._month += 11;
            }
            scope.date = scope.days_in_month(scope._month + 1, scope._year);
            scope.build(scope.date);
            //scope.default_month = scope.full_month[scope._month-1];
        };

        /***********THIS BUILDS A TABLE***************/

        // get the number of days for a specific month
        scope.days_in_month = function (_month, _year) {
            return new Date(_year, _month, 0).getDate();
        };

        // get a weekday of a date
        scope.get_day = function (_month, _year, _day) {
            _day = (_day == undefined) ? 1 : _day;
            return new Date(_year, _month - 1, _day).getDay();
        };

        // build the table
        scope.build = function (num_of_days) {
            var i;

            scope.table         = [];
            var month_start_day = scope.get_day(scope._month + 1, scope._year);

            // prefil the table with dates from prev month
            if (month_start_day > 0) {
                var days_of_last_month         = scope.days_in_month(scope._month, scope._year);
                var day_of_last_month_last_day = scope.get_day(scope._month, scope._year,
                                                               days_of_last_month);
                var table_start_date           = days_of_last_month - day_of_last_month_last_day;

                for (i = 0; i < month_start_day; i++) {
                    scope.table.push(table_start_date++);
                }
            }

            // build the rest having number of days in current month
            for (i = 1; i <= num_of_days; i++) {
                scope.table.push(i);
            }

            // post fill the table untill its %7
            var post_fill = 1;
            while (scope.table.length % scope.row_size != 0) {
                scope.table.push(post_fill++);
            }

            // convert a single dim array to ray or rays
            i = 0;
            while (true) {
                var size = (i + scope.row_size < scope.table.length) ? scope.row_size
                    : scope.table.length - i;

                scope.table.splice(i, size,
                                   scope.convert_arr_of_obj(scope.table.slice(i, size + i), i));
                if (++i >= scope.table.length) {
                    break;
                }
            }
        };

        scope.generate_years = function () {
            var year_list = [];
            scope.l_min   =
                (scope._year < scope.default_min_date.getFullYear()) ? scope._year
                    : scope.default_min_date.getFullYear();
            scope.l_max   =
                (scope._year < scope.default_max_date.getFullYear())
                    ? scope.default_max_date.getFullYear() : scope._year;
            for (var i = scope.l_min; i <= scope.l_max; i++) {
                year_list.push(i);
            }
            return year_list;
        };

        scope.render = function () {
            //scope._month = scope.full_month.indexOf(scope._month);
            scope.build(scope.days_in_month(scope._month + 1, scope._year));
        };

        scope.render_year = function () {
            scope.build(scope.days_in_month(scope._month + 1, scope._year));
        };

        /******************************************/

        scope.year_list     = scope.generate_years();
        scope.local_ngModel = scope.ngModel;

        scope.errorShow = false;

        scope.$watch("errorShow", function (n, o) {
            scope.valid = !n && scope.ngSet;
        });

        scope.$watch("ngSet", function (n, o) {
            if (n) {
                scope.valid = !scope.errorShow && n;
            }
        });

        var counter = 0;

        scope.toUTC = function(date) {
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        };


        scope.$watch("local_ngModel", function(n,o) {

            console.log(n);


            // if(n) {
            //     //console.log(n);
            //     console.log("something is happening");
            // }
        });






        scope.$watch("ngModel", function (n, o) {
            if (n) {

                console.log("happening");
                //return;


                ++counter;
                if (counter > 1) {
                    scope.ngSet = true;
                }

                if (!scope.ngSet) {
                    scope.$watch('calendarOpened', function (n, o) {
                        if (n == true) {
                            scope.ngSet = true;

                            scope.parseDate(scope.local_ngModel);
                            scope._month        = scope.ngModel.getMonth();
                            scope.local_ngModel = scope.ngModel;
                            scope._year         = scope.local_ngModel.getFullYear();

                            scope.second_box.foo(scope.second_box.value);
                            scope.first_box.foo(scope.first_box.value);
                            scope.third_box.foo(scope.third_box.value);

                            if (scope.local_ngModel instanceof Date) {
                                scope._month = scope.local_ngModel.getMonth();
                                scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                                scope.local_ngModel.getFullYear()));
                            }

                        }
                    });
                } else {
                    if (scope.ngModel && scope.ngModel instanceof Date) {
                        scope.ngModel.setHours(0, 0, 0, 0);

                        scope.local_ngModel = scope.ngModel;
                        scope.parseDate(scope.ngModel);

                        scope._month        = scope.ngModel.getMonth();
                        scope._year         = scope.local_ngModel.getFullYear();
                        scope.local_ngModel = scope.ngModel;
                    }

                    if (scope.local_ngModel instanceof Date) {
                        scope._year  = scope.local_ngModel.getFullYear();
                        scope._month = scope.local_ngModel.getMonth();
                        scope.build(scope.days_in_month(scope.local_ngModel.getMonth() + 1,
                                                        scope.local_ngModel.getFullYear()));
                    }

                }

                //scope.ngSet = true;
            }

        });

    }

    function directive() {
        return {
            scope       : {
                minDate       : '=?',
                maxDate       : '=?',
                ngModel       : '=',
                format        : '@?',
                yearRange     : '@?',
                offset        : '@?',
                calendarOpened: '=?',
                valid         : '=?'
            },
            require     : 'ngModel',
            restrict    : 'E',
            templateUrl : '/Modules/AlveoDatepicker/template.html',
            transclude  : true,
            link        : function (s) {

                /*********** DEFINITIONS **********/
                s.weekday =
                    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                s.short_weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

            },
            controller  : "AlveoPickerController",
            controllerAs: 'ctrl'
        };
    }

    angular.module("alveo.modules.datepicker", ["ngAnimate"])
        .controller("AlveoPickerController", controllerDependencies)
        .directive("alveoPicker", directive);

})(angular);
