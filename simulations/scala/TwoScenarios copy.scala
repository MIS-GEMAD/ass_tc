package ass

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class TwoScenarios extends Simulation {

	val httpProtocol = http
		.baseUrl("http://localhost:8080/")
		

	val headers_0 = Map(
		"Content-Type" -> "application/json")

	object CreateExplorer1 {
		val createExplorer1 = exec(http("POST EXPLORER 1")
			.post("/actors")
			.body(RawFileBody("c:/temp/gatlingFiles/actor_explorer_1.json"))
			.headers(headers_0))
		.pause(1)
	}
	
	object ModifyExplorer1{
		val modifyExplorer1 = exec(http("PUT EXPLORER 1")
			.put("/actors/622c04299552b0ab808ecd3d")
			.body(RawFileBody("c:/temp/gatlingFiles/actor_explorer_put_1.json"))
			.headers(headers_0))
		.pause(2)
	}


	object CreateExplorer2 {
		val createExplorer2 = exec(http("POST EXPLORER 2")
			.post("/actors")
			.body(RawFileBody("c:/temp/gatlingFiles/actor_explorer_2.json"))
			.headers(headers_0))
		.pause(2)
	}

	object CreateManager1 {
		val createManager1 = exec(http("POST MANAGER 1")
			.post("/actors")
			.body(RawFileBody("c:/temp/gatlingFiles/actor_manager_1.json"))
			.headers(headers_0))
		.pause(1)
	}

	object CreateAdmin1 {
		val createAdmin1 = exec(http("POST ADMINISTRATOR 1")
			.post("/actors")
			.body(RawFileBody("c:/temp/gatlingFiles/actor_admin_1.json"))
			.headers(headers_0))
		.pause(1)
	}

	object ShowActors {
		val showActors = exec(http("GET ALL ACTORS")
			.get("/actors/")
			.headers(headers_0))
		.pause(1)
	}


	object CreateTrip1 {
		val createTrip1 = exec(http("POST TRIP 1")
			.post("/trips")
			.body(RawFileBody("c:/temp/gatlingFiles/trip1.json"))
			.headers(headers_0))
		.pause(1)
	}

	object CreateTrip2 {
		val createTrip2 = exec(http("POST TRIP2")
			.post("/trips")
			.body(RawFileBody("c:/temp/gatlingFiles/trip2.json"))
			.headers(headers_0))
		.pause(2)
	}


	object ModifyTrip1 {
		val modifyTrip1 = exec(http("PUT TRIP1")
			.put("/trips/622c04299552b0ab808ece5v")
			.body(RawFileBody("c:/temp/gatlingFiles/trip1_put.json"))
			.headers(headers_0))
		.pause(2)
	}

	object ShowTrips {
		val showTrips = exec(http("GET TRIPS")
			.get("/trips/")
			.headers(headers_0))
		.pause(2)
	}

	val customerScn = scenario("Explorers").exec(CreateExplorer1.createExplorer1,
												CreateExplorer2.createExplorer2,
									  			ModifyExplorer1.modifyExplorer1,
									  			ShowActors.showActors)
	
	val adminsScn = scenario("Manager").exec( CreateManager1.createManager1,					 
									  		  CreateTrip1.createTrip1,
									          CreateTrip2.createTrip2,
									          ModifyTrip1.modifyTrip1,
									          ShowTrips.showTrips)
	
	setUp(
		customerScn.inject(atOnceUsers(1)),
		adminsScn.inject(atOnceUsers(1))
		).protocols(httpProtocol)
}
