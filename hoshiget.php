<?php
ini_set('date.timezone', 'Asia/Tokyo');
require('vendor/autoload.php');
use WebSocket\Client;

$target_genreid="";
if(isset($argv[1]))
        $target_genreid=$argv[1];

$sleep=false;
if(isset($argv[2]))
{
	if(strstr($argv[2],":"))
	{
		while((date("H:i")!=$argv[2]))
		{
			echo "\rnow ".date("H:i:s")." target:".$argv[2]."";
			sleep(1);
		}
		$sleep=true;
	}
}
echo "\n";


$onetime=false;
if(($sleep==false && isset($argv[2]))||($sleep==true && isset($argv[3])))
	$onetime=true;



$d=json_decode(file_get_contents("https://www.showroom-live.com/api/live/onlives?_=1534505242803"),true);
foreach($d["onlives"][0]["lives"] as $key=>$data)
{
	if(!strstr($data["room_url_key"],"gband") && ($target_genreid=="" || (!strstr($target_genreid,"x") && $target_genreid==$data["genre_id"]) || (strstr($target_genreid,"x") && str_replace("x","",$target_genreid)!=$data["genre_id"])))
        {
		$urllist[]=$data;
        }
}

	
$cmd = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222';
exec($cmd . " > /dev/null &");

sleep_(3);
$totalsleepcnt=0;
$id=0;
for($i=0;$i<=count($urllist)-1;$i++)
{

	echo $urllist[$i]["room_url_key"]." ".$urllist[$i]["main_name"]."\n";
	echo $urllist[$i]["genre_id"]."\n";
	if(is_file("lastviwing_".$urllist[$i]["room_url_key"]))
	{
		if(time()>filemtime("lastviwing_".$urllist[$i]["room_url_key"])+60*60)
		{
			$viwing_ok=true;
		}
		else
		{
			$viwing_ok=false;
		}
	}
	else
	{
		$viwing_ok=true;
	}
	if($viwing_ok==true)
	{
		$viewingcnt++;
	        do{
			$endpoints = json_decode(`curl -s http://localhost:9222/json/new`);
	        } while(empty($endpoints));

	        $endpoint = $endpoints->webSocketDebuggerUrl;

	        $client[$i] = new Client($endpoint);
	        $client[$i]->send(json_encode([
	            'id' => $id,
	            "method" => 'Page.enable',
	        ]));
		$id++;
		touch("lastviwing_".$urllist[$i]["room_url_key"]);
		echo "viewing ok\n";

		$client[$i]->send(json_encode([
		    'id' => $id,
		    "method" => 'Page.navigate',
		    "params" => ['url' => 'https://www.showroom-live.com/'.$urllist[$i]["room_url_key"]]
		]));
		$id++;
/*
$intent_result_string = ""; // keep reading until chrome replies with message
while ($intent_result_string == "") {
	try {
		$intent_result_string = trim($client[$i]->receive());
	} catch (Exception $e) {}
}
echo $intent_result_string."\n";
    $frameId = null;
    while ($data = json_decode($client[$i]->receive())) {
        //Page.navigateに対応。対象frameIdが返ってくる
        if (@$data->id == 2) {
            $frameId = $data->result->frameId;
echo "frameId ".$frameId ."\n";
        }
	echo "  ".@$data->params->frameId."\n";
	echo "  ".@$data->method ."\n";
        if (@$data->method == 'Page.frameStoppedLoading' && @$data->params->frameId == $frameId) {
		$client[$i]->send(json_encode([
                    'id' => $id,
                    "method" => 'Runtime.evaluate',
                    "params" => ['expression' => 'document.querySelector(\"#icon-room-twitter-post\").click()']
                ]));
	}
    }
*/
		sleep_(7+(int)($viewingcnt*0.5));
		$id++;

//		{'id': 1, 'method': 'Runtime.evaluate', 'params': {expression: 'document.querySelector(\"#giticon\").click()'}}

	//	sleep(1000);
		
	
	if($onetime==true)
		break;
	if($viewingcnt>25)
		break;
	}
}
if($onetime==true)
	sleep_(120);
else
	sleep_(60*30);

exec('pkill -f "' . $cmd . '"');

function sleep_($cnt)
{
global $totalsleepcnt;
	for($i=1;$i<=$cnt;$i++)
	{
		$totalsleepcnt++;
		echo " ".$i."/".$cnt."(".$totalsleepcnt.")";
		sleep(1);
	}
	echo "\n";
	echo "\n";
	echo "\n";
echo date("Y/m/d H:i:s")."\n";
	echo "\n";
	echo "\n";
	echo "\n";
}
