      --Test this is a line comment 1
select 
      COL1     
,COL2   --line comment 2
,COL3 = (select col4 from table4 where col1 = col1)
FROM TABLE1 
where COL1='TEST' and COL2=4 
group      BY COL3 
HAVING SUM(COL3) > 0 
order BY COL1,COL2;

/* this 
      is 
      a
      block
      comment 1
   */ 
SELECT col2 FROM table2


/* this is a block comment */ SELECT col2 FROM table2

 SELECT col2 = case when 1=1 /* this is a block comment */ then /* this is a block comment */ 2 END
 FROM table2

