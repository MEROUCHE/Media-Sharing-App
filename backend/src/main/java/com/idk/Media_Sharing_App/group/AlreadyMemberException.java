package com.idk.Media_Sharing_App.group;

public class AlreadyMemberException extends RuntimeException {
    public AlreadyMemberException() {
        super("Already a member of this group");
    }
}