Copyright 2016 Crown Copyright

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


UI
============


This module contains a Gaffer read only UI prototype that connects to a Gaffer REST API.
See [gaffer-tools/ui](https://github.com/gchq/gaffer-tools/tree/master/ui).

Limitations:
- There are currently no error messages.
- There is no validation.
- Read only - no data can be added via the UI.


If you wish to deploy the war file to a container of your choice, then use this option.

To build the war file along with all its dependencies then run the following command from the parent directory:
' mvn clean install -Pquick'

To deploy it to a server of your choice, take target/ui-[version].war and deploy as per the usual deployment process for your server.

There is a settings page in the ui where you can temporarily change the REST API URL, alternatively you will need to edit the settings.js file to set the URL permanently.

Alternatively there is a maven profile "standalone-ui" that you can use to start the UI in a standalone tomcat server.
Note that in order to use the UI it will need to be connected separately to a Gaffer REST API.

```bash
mvn install -Pquick -Pstandalone-ui -pl ui -am
```


## Road Traffic example

To demo the UI you can connect it to the Gaffer Road Traffic example REST API.

To deploy both the road-traffic example REST API and the UI you can use the
maven "road-traffic-demo" profile:

```bash
mvn install -Pquick -Proad-traffic-demo -pl ui -am
```

### Walkthrough

We've modelled the road use data as a simple Gaffer graph to demonstrate how Gaffer lets users explore and summarise data.

There are edges representing:

 - Region to Location: e.g South West - Bristol, South West - Devon etc.
 - Location to Roads: e.g. Bristol - M32 etc
 - Roads and their Junctions: e.g. M32 - M32:1, M32 - M32:2, etc.
 - Junctions and their locations: e.g. M32:2 - 361150,175250, etc.
 - Traffic counts between junctions during specific hours: e.g. M32:1 - M32:2 etc.

We can start with a uk region, such as the South West, and find the locations within that region. Then pick one or more of those locations, find the roads there and list their junctions. Then between any pair of adjacent junctions, we can summarise the vehicle counts over a time range of our choosing. 

There will be multiple edges representing the traffic counts between the same two junctions: one for each hour of observation recorded in the data. Each of the RoadUse edges has properties attached to it representing the start of the hour during which the traffic was counted, the end of the hour, the total vehicle count for the hour and a map of vehicle type to count for the hour.

For example:

```json
 {
    "group": "RoadUse",
    "source": "M32:1",
    "destination": "M32:M4 (19)",
    "directed": true,
    "class": "uk.gov.gchq.gaffer.data.element.Edge",
    "properties": {
      "countByVehicleType": {
        "uk.gov.gchq.gaffer.types.simple.FreqMap": {
          "HGVR3": 2004,
          "BUS": 1375,
          "HGVR4": 1803,
          "AMV": 407034,
          "HGVR2": 11369,
          "HGVA3": 1277,
          "PC": 1,
          "HGVA5": 5964,
          "HGVA6": 4817,
          "CAR": 320028,
          "HGV": 27234,
          "WMV2": 3085,
          "LGV": 55312
        }
      },
      "startDate": {
        "java.util.Date": 1034316000000
      },
      "endDate": {
        "java.util.Date": 1431540000000
      },
      "count": {
        "java.lang.Long": 841303
      }
    }
  }
```

Gaffer allows us to query the set of RoadUse edges between two junctions across a time range that we choose. It will return a single RoadUse edge representing the sum of the vehicle counts over the time period we have queried for.   

The following steps will take you through a simple exploration and summarisation of the road use data.

##### Navigate to the UI (the zoom is a bit temperamental in Safari):
```
localhost:8080/ui
```

##### Add a seed as the starting point for your query:
- click 'Add Seed'
- vertex: ```region```
- value: ```South West```
- click 'Add'


##### Build and execute a query to find all locations within the South West region:
- click on the 'South West' vertex (displayed as a grey circle in the top left hand corner of the page) 
- click 'Build query'
- click on the 'Get Elements' link
- select 'RegionContainsLocation'
- click 'Next'
- click 'Execute'

The South West vertex will still be selected - click on an empty part of the graph to deselect it.
Move the graph around by clicking and dragging the cursor.
Scroll to zoom in/out.

##### Build and execute a query to find all roads within Bristol:
- click on the 'Bristol, City of' vertex
- click 'Build query'
- click on the 'Get Elements' link
- select 'LocationContainsRoad'
- click 'Next'
- click 'Execute'


#### Build and execute a query to find all junctions on the M32:
- click on the 'M32' vertex
- click 'Build query'
- click on the 'Get Elements' link
- select 'RoadHasJunction'
- click 'Next'
- click 'Execute'


#### Build and execute a query to find the road use between junctions M32:1 and M32:M4 between 6AM and 7AM on 5/3/2005:
- click on the 'M32:1' vertex
- click 'Build query'
- click on the 'Get Elements' link
- select 'RoadUse'
- This time we are going to add a filter to the start and end times
- click 'Add filter'
- Enter the following startDate filter:
```
property: startDate
function: uk.gov.gchq.koryphe.impl.predicate.IsMoreThan
orEqualTo: true
value: {"java.util.Date": 1115103600000}
```
- click 'Add filter'
- Enter the following endDate filter:
```
property: endDate
function: uk.gov.gchq.koryphe.impl.predicate.IsLessThan
orEqualTo: true
value: {"java.util.Date": 1115107200000}
```
- click 'Next'
- click 'Execute'

If you find the 'RoadUse' edge in the graph and click on it, you will see the following information in the pop-up:

```
M32:1 to M32:M4 (19)
RoadUse	
countByVehicleType: {"uk.gov.gchq.gaffer.types.FreqMap":{"HGVR3":44,"BUS":10,"HGVR4":28,"AMV":6993,"HGVR2":184,"HGVA3":19,"PC":0,"HGVA5":99,"HGVA6":40,"CAR":5480,"HGV":414,"WMV2":44,"LGV":1045}}

endDate: {"java.util.Date":1115107200000}

count: {"java.lang.Long":14400}

startDate: {"java.util.Date":1115103600000}
```

This shows the vehicle types and their counts between these two junctions for the time period described by the filters.

Alternatively, if you click the 'Table' tab at the top of the UI you will see a table with 'Entity' and 'Edge' tabs.

Click the 'Edge' tab and you will see a table listing all of the edges displayed in the Graph based on the queries run so far.

Clicking the 'Raw' tab at the top of the UI displays the Json constructed and handed to Gaffer to run the queries.


#### Now we will repeat the previous query but with a bigger time window - this time between 6AM and 8AM on 5/3/2005:
- click on the 'M32:1' vertex
- click 'Build query'
- click on the 'Get Elements' link
- select 'RoadUse'
- This time we are going to add a filter to the start and end times with a bigger time window
- click 'Add filter'
- Enter the following startDate filter:
```
property: startDate
function: uk.gov.gchq.koryphe.impl.predicate.IsMoreThan
orEqualTo: true
value: {"java.util.Date": 1115103600000}
```
- click 'Add filter'
- Enter the following endDate filter:
```
property: endDate
function: uk.gov.gchq.koryphe.impl.predicate.IsLessThan
orEqualTo: true
value: {"java.util.Date": 1115110800000}
```
- click 'Next'
- click 'Execute'

Now if you click on the 'RoadUse' edge, or visit the 'Edges' Table view, you'll see that two 'RoadUse' summaries are displayed:

```
M32:1 to M32:M4 (19)
RoadUse	
countByVehicleType: {"uk.gov.gchq.gaffer.types.simple.FreqMap":{"HGVR3":44,"BUS":10,"HGVR4":28,"AMV":6993,"HGVR2":184,"HGVA3":19,"PC":0,"HGVA5":99,"HGVA6":40,"CAR":5480,"HGV":414,"WMV2":44,"LGV":1045}}

startDate: {"java.util.Date":1115100000000}

endDate: {"java.util.Date":1115103600000}

count: {"java.lang.Long":14400}

RoadUse	
countByVehicleType: {"uk.gov.gchq.gaffer.types.FreqMap":{"HGVR3":68,"BUS":28,"HGVR4":50,"AMV":13640,"HGVR2":370,"HGVA3":35,"PC":0,"HGVA5":204,"HGVA6":96,"CAR":10924,"HGV":823,"WMV2":95,"LGV":1770}}

endDate: {"java.util.Date":1115110800000}

count: {"java.lang.Long":28103}

startDate: {"java.util.Date":1115103600000}
```
The top one is from the first query.

The next is a summary over the two hours we specified in our second query. (You can verify this by querying again for second hour separately and then adding counts from the two single-hour summaries together).

In this example we have summarised the vehicle counts by adding them together. Gaffer users are free to define the objects that represent the properties on an edge and the functions used to summarise them and so supports things that are much more complex than adding integers together.

There are some in-depth examples based around the Java API here: [Getting Started](https://gchq.github.io/gaffer-doc/summaries/getting-started.html).
