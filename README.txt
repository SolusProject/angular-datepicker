/*********IKDATAPICKER**********/


REQUIRED LIBRARIES: 

-	angularjs version 1.5.5 preferably (//ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js)
-	angular-animate version 1.5.5 preferably (//ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-animate.js) 
-	bootstrap version 3.3.5 preferably (http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js)
- 	jQuery (https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js)

DESCRIPTION:

This is a multifunctional angularjs datepicker directive with support of different time formats, which supports both a single calendar and two calendars for selecting a time range. A directive is restricted to Element only. To instantiate a single datepicker use <alveo-picker></alveo-picker> element name

ATTRIBUTES:

- FORMAT

This datepicker defaults to “dd/MM/yyyy” format and will persist if provided with an unreadable format. To give a format - use a format attribute (ex: format=”MMMM dd,yyyy”).  Format string can be composed from the following:

“MM”:  Month in year, padded (01-12)
“MMM”: Month in year (Jan-Dec), 
“MMMM”: Month in year (January-December);
“yy”: Two digit year if datepicker’s date select range is less then 100 years, will default to four digit otherwise
“yyyy”: Four digit year
“dd” : Day in month padded

and separated by one character of a choice in between (ex: format=”MMMMMdddyy” is still a readable format, but format=”MMMMMddyy” is not), also something like format=”MMMM/dd/MM” is not a readable format.


- MIN-DATE and MAX-DATE

Min-date and max-date attributes are the way to restrict maximum and minimum dates to be selected on the calendar (or to be typed in).  Attributes require ng-model and can be dynamically changed. If not readable will default into +- 10 years from current date (default can be changed, reference year-range attribute). Example of use: min-date="min_date" max-date="picker_input2", where “min_date” and “picker_input2” are ng-models.


NG-MODEL 

Is a required model attribute of a Date type. Ex: ng-model=”picker_input”, where “picker_input” was instantiated as “$scope.picker_input = new Date();” 


YEAR-RANGE

Is a nonnegative number attribute, which will create a range of +- N years from the current date. If min-date or max-date is present they will take precedence if less then N. To use add year-range=”2” attribute to the datepicker element.

OFFSET

Is a usefull attribute if you want to push boundaries of min-date and max-date for a few days. For instance setting offset=”1” will make min-date and max-date exclusive, and offset=”0” will make min-date and max-date inclusive for a selection; offset=”1” by default and cannot be greater then ten or less then ten.

TOOGLE

True by default. It’s responsible for showing or hiding the calendar. To use add  toogle=”false” attribute into an existing element.


USAGE OF TWO DATEPICKERS FOR DATE RANGE SELECTION

In html file create two datepickers with lover and upper bound for both of them, where lover bound is “$scope.min = new Date(); $scope.min.setDate(1);” and upper bound is ”$scope.max = new Date(); $scope.max.setDate(30);” this should give a window in ~30 days.

<alveo-picker min-date=”min”> </alveo-picker>
<alveo-picker max-date=”max”> </alveo-picker>

Add two ng-models - one for each of them. For instance “$scope.model1 = new Date(); $scope.model1.setDate(2)” and “$scope.model2 = new Date(); $scope.model2.setDate(29)”; Ng-models should be inside the timeframe, or otherwise they will reset to the date, which is in range. 


<alveo-picker min-date=”min”  ng-model=”model1”> </alveo-picker>
<alveo-picker ng-model=”model2” max-date=”max”> </alveo-picker>


Now make “$scope.model2” an upper bound for “$scope.model1” and “$scope.model1” a lover bound for “$scope.model2”.


<alveo-picker min-date=”min”  ng-model=”model1” max-date=”model2” > </alveo-picker>
<alveo-picker min-date=”model1” ng-model=”model2” max-date=”max”> </alveo-picker>

Consequently, every time you will change “$scope.model1” the bound will be applied to “$scope.model2” and vice versa, which will insure that “$scope.model1” is always less then “$scope.model2” and there is at least one day difference in between them. If you want to allow your  “$scope.model1” equal “$scope.model2” just set offset=”0” for both of them.

<alveo-picker min-date=”min”  ng-model=”model1” max-date=”model2” offset=”0”> </alveo-picker>
<alveo-picker min-date=”model1” ng-model=”model2” max-date=”max” offset=”0”> </alveo-picker>

