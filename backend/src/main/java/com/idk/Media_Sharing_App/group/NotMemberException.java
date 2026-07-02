package com.idk.Media_Sharing_App.group;

public class NotMemberException extends RuntimeException {
    public NotMemberException() {
        super("You are not a member of this group");
    }
}