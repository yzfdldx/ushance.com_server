
exports.method = (val1, val2, val3, val4) => {
	var hint;
	var mysql = {
		table: 'create database 数据库名字',
		createTable: 'create table 表名字(字段 int(100) not null auto_increment primary key,字段  varchar(23)) charset utf8 collate utf8_unicode_ci', // 创建表
		dropTable: 'drop table 表名字', // 删除表
		addAlter: 'alter table 表   add (字段  varchar(50) charset utf8 collate utf8_unicode_ci)', // 创建字段
		dropAlter: 'alter table 表  drop (字段)', // 删除字段
		select: 'select (*,字段,字段) from 表  where (字段 = 值    and 字段 = 值) [limit 0,4]', // 查询数据
		insert: 'insert into 表(字段,字段) values(值,值)', // 插入数据
		delete: 'delete from 表   where (字段 = 值    and 字段 = 值)', // 删除数据
		update: 'update 表   set (字段 = 值    , 字段 = 值) where (字段 = 值    and 字段 = 值)', // 修改数据
	}
	var mysqlData = {
		select: 'select ' + val1 + ' from ' + val2 + '  where ' + val3 + ' ' + val4,
		insert: 'insert into ' + val1 + '(' + val2 + ') values(' + val3 + ')',
		delete: 'delete from ' + val1 + '   where (' + val2 + ')',
		update: 'update ' + val1 + '   set ' + val2 + ' where ' + val3,
		addAlter: 'alter table ' + val1 + '   add ' + val2,
		dropAlter: 'alter table ' + val1 + '  drop '  + val2,
		createTable: 'create table ' + val1 + '(' + val2 + ')',
		dropTable: 'drop table ' + val1,
	}
	
	hint = {
		mysql: mysql,
		mysqlData: mysqlData,
	}
	
	return hint
}

exports.mysql = (command, fn, poolInto) => { // mysql操作
	const mysql = require('mysql');
	var pool;
	if (poolInto) {
		if (typeof poolInto == 'object') {
			pool = poolInto;
		} else {
			pool = mysql.createPool({
				host: 'localhost',
				port: 3306,
				database: poolInto, // 数据库
				user: 'root',
				password: '',
			});
		}
	} else {
		pool = mysql.createPool({
			host: 'localhost',
			port: 3306,
			database: 'test', // 数据库
			user: 'root',
			password: '',
		});
	}

	pool.getConnection((err, connecting) => {
		var str;
		if (err) {
			fn(err);
		} else { // 链接成功
			connecting.query(command,(err, result) => {fn(err, result);});
		}
	});
	
}

