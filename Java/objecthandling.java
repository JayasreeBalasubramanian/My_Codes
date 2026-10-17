class students{
    String name;
    students(String name)
    {
        this.name=name;
    }
    students(students s)
    {
        this.name=s.name;
    }
}
public class objecthandling
{
    public static void main(String args[]){
        students s1=new students("alice");
        students s2=new students("bob");
        students s3=new students("jack");
        students s4=new students("peter");
        students copy=new students(s1);
        s4=s1;
        System.out.println("hashcode of student4:"+s4.hashCode());
        System.out.println("hashcode of student1:"+s1.hashCode());
        System.out.println("hashcode of student2:"+s2.hashCode());
        System.out.println("hashcode of student3:"+s3.hashCode());
        System.out.println("hashcode of student copy:"+copy.hashCode());
        System.out.println("s1.equals(s2): " + s1.equals(s2));
        System.out.println("s1 == s4: " + (s1 == s4));
      
    }
}
