var a = 0
var my_pos = v[0, 0]
var dir = v[1, 0]

function init(me) {
    
}

function main(me) {
    my_pos = me.pos()
    dir = v[rand(0, 10) - 5, rand(0, 10) - 5]
    me.move(dir)
    a = a + 1
    entities = me.visibile()
    for (var ent of entities) {
	me.cast(0, ent.pos() - my_pos);
    }
}
