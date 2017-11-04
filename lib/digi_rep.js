/***
*preleva la lista di azioni da actions_url e la assegna ad action_list
*/
function getActions(m, s) {
  var actions_url = "http://localhost/Babylon.js-master/myprg/basic_player/actions1.jason";
  //var actions_url = "http://localhost:8000/basic_player/actions1.jason";
  $("div.btnStart").empty();
  $.getJSON(actions_url, function(result){
    //var acts_list = [];    
    $.each(result, function(i, field){
      //acts_list.push(i);
      //console.log(i.replace(' ', '_'));
      $("div.btnStart").append('<input type="button"'+' id="'+i.replace(' ', '_')+'"'+' value='+'"' +i+'" />');
      $("input#"+i.replace(' ', '_')).click(function(){startActions(i);}) 
    });
    a_l_o = result;
    setPos(act_to_start);
    setIniAct(act_to_start);
      //var act_lst = action_lists.filter(function(act){return act.des == ad});
  //var act_init = action_list.filter(function(act){return act.state == INIT});
    //$('.btnStart').append("<input type='button'");   
    $('.btnStart').css('visibility', 'visible');
    //console.log(act_init);
  });
}

/***
*converte una stringa "num1, num2,  num3" in un 3-vettore babylon
*usata da:getActions
*/    
function str_to_point(str_p) {              
  var point;
  point = str_p.split(",");
  point[0] = parseInt(point[0]);
  point[1] = parseInt(point[1]);
  point[2] = parseInt(point[2]);
  return new BABYLON.Vector3(point[0], point[1], point[2]);       
}

function setPos(ad) {
  obj_pos = $.map(a_l_o[ad], function(val, key) {
    if(val.id == -1) {
      return val;
    }
  });
  
  $.each(p_mesh, function(i, field){
    //field.dispose();
  });
  //console.log(obj_pos);
  obj_pos.forEach(function(val) {    
    if(val.mesh == "player1") {
      player1.visibility = true;
      player1.position = str_to_point(val.to);
      sphere.position = str_to_point(val.to);
      sphere.position.y = -4.5;
      p_mesh['player1'] = player1;
      
      //sphere.position.x = player1.position.x;  
      //sphere.position.z = player1.position.z;
      
    } else {
      p_mesh[val.mesh] = player1.clone(val.mesh);
      p_mesh[val.mesh].skeleton = skeleton.clone("clonedSkeleton");
      p_mesh[val.mesh].position = str_to_point(val.to);
    }
  });
}

function setIniAct(ad) {
  act_init = $.map(a_l_o[ad], function(val, key) {
    if(val.state == 0) {
      return val;
    }
  });
  act_init.forEach(function(val) {
    val.mesh = p_mesh[val.mesh];
    val.to = str_to_point(val.to);
  });
}

/***
* tM = mesh to rotate.
* lAt = vector3(xyz) of target position to look at 
* (http://www.babylonjs-playground.com/#Q4LKP#2)
*/   
function lookAt(tM, lAt) {
  console.log(tM.position);
  lAt = lAt.subtract(tM.position);
  tM.rotation.y = -Math.atan2(lAt.z, lAt.x) - Math.PI/2;
}  

        function startAct(a_b) {
          console.log(a_b);
          for(var i=0;i<a_b.length;i++) {
            console.log(i, a_b[i]);
            console.log(action_list[a_b[i]].type);
            if(action_list[a_b[i]].type == 'run') {
              setPlyRun(action_list[a_b[i]], {start:0,end:30});
            } else if(action_list[a_b[i]].type == 'move') {
              mesh_move(action_list[a_b[i]], {start:0,end:30})
            } else if(action_list[a_b[i]].type == 'pass') {
              startPlyKick(action_list[a_b[i]]);
            } else if(action_list[a_b[i]].type == 'cross') {
              //console.log('in if cross');
              startPlyCross(action_list[a_b[i]]);
            }
          }
        }

function mesh_move(act, frame, spline) {		
	  var animationPly = new BABYLON.Animation("mash_move", "position", fps, 
                                        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
          var keys = [];
          if(spline) {
            keys.push({frame: frame.start, value: spline[0]});
            keys.push({frame: 8, value: spline[1]});
            keys.push({frame: 15, value: spline[2]});
            keys.push({frame: 23, value: spline[3]});
            keys.push({frame: frame.end, value: spline[4]});
          } else {
            keys.push({frame: frame.start, value: act.mesh.position});
            keys.push({frame: frame.end, value: act.to});          
          }
          animationPly.setKeys(keys);
          act.mesh.animations = [];
          act.mesh.animations.push(animationPly);
          scene.beginAnimation(act.mesh, 0, fps, false);
          var event1 = new BABYLON.AnimationEvent(frame.end, 
                            function(){
                              console.log('over move');
                              act.state = OVER;
                            }, 
                            true);
          //console.log(trigger_action);
          animationPly.addEvent(event1);          
} 

function startPlyKick(act) {
	  //console.log(act.mesh);
  lookAt(act.mesh, act.to);
  scene.beginAnimation(act.mesh.skeleton, 30, 50, false, 1.0, 
  function(){
    console.log('over kick');
    act.state = OVER;
    mesh_move({mesh:sphere, to:new BABYLON.Vector3(act.to.x,-4.5,act.to.z), state:-1}, {start:0,end:act.f});
              //if isAllOver(act.when_over);
               startAct(/*act.beg*/[]);
               //else
               //  act.state = WAIT;             
    });		
} 

function startActions(ad) {    
  //scene = createScene();
  act_to_start = ad;
  startScene();
  for(var i=0;i<act_init.length;i++) {
    if(act_init[i].type == 'pass') {
      //console.log(act_init[i].to);
      //act_init[i].mesh = player1;
      //startPlyKick(act_init[i]);
      mesh_move({mesh:act_init[i].mesh, to:act_init[i].to, state:-1}, {start:0,end:act_init[i].f});
    }
  }
  //console.log(act_init);  
}
